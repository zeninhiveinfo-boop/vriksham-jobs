import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRecordId } from '@/lib/record-id';
import { getActingUser } from '@/lib/access-control';

function cleanText(value) {
	return String(value || '').trim();
}

const PAYMENT_MODES = ['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Other'];

function normalizePaymentDetails(value, action) {
	if (action !== 'mark_paid') {
		return { paymentDetails: null, error: '' };
	}

	const payment = value && typeof value === 'object' ? value : {};
	const amountRaw = cleanText(payment.amount).replace(/,/g, '');
	const amountNumber = Number(amountRaw);
	const mode = cleanText(payment.mode) || 'UPI';
	const referenceId = cleanText(payment.referenceId);
	const receivedDate = cleanText(payment.receivedDate);
	const notes = cleanText(payment.notes);

	if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
		return { paymentDetails: null, error: 'Enter a valid payment amount.' };
	}

	if (!PAYMENT_MODES.includes(mode)) {
		return { paymentDetails: null, error: 'Select a valid payment mode.' };
	}

	if (!receivedDate) {
		return { paymentDetails: null, error: 'Enter the payment received date.' };
	}

	return {
		error: '',
		paymentDetails: {
			amount: String(amountNumber),
			currency: 'INR',
			mode,
			referenceId,
			receivedDate,
			notes
		}
	};
}

function getUpdatedFields(action, selectedPlan) {
	if (action === 'reject') {
		return {
			clientStatus: 'Rejected',
			approvalStatus: 'rejected',
			billingStatus: 'not_applicable',
			paymentStatus: 'not_applicable',
			serviceStatus: 'rejected',
			portalAccessStatus: 'disabled',
			noteTitle: 'Employer request rejected.'
		};
	}

	if (action === 'mark_paid') {
		return {
			clientStatus: 'Hiring In Progress',
			approvalStatus: 'approved',
			billingStatus: 'paid',
			paymentStatus: 'completed',
			serviceStatus: 'hiring_in_progress',
			portalAccessStatus: 'locked_until_shortlisted_profiles_ready',
			noteTitle: 'Payment marked completed by admin. Hiring process started.'
		};
	}

	if (action === 'mark_portal_ready') {
		return {
			clientStatus: 'Client Portal Ready',
			approvalStatus: 'approved',
			billingStatus: 'paid',
			paymentStatus: 'completed',
			serviceStatus: 'shortlisted_profiles_ready',
			portalAccessStatus: 'ready_to_share',
			noteTitle: 'Shortlisted profiles are ready. Client portal can now be shared.'
		};
	}

	if (selectedPlan === 'end_to_end') {
		return {
			clientStatus: 'Approved - Payment Pending',
			approvalStatus: 'approved',
			billingStatus: 'custom_pricing_payment_pending',
			paymentStatus: 'pending',
			serviceStatus: 'waiting_for_payment',
			portalAccessStatus: 'locked_until_shortlisted_profiles_ready',
			noteTitle: 'End-to-end employer request approved. Payment pending.'
		};
	}

	return {
		clientStatus: 'Approved - Payment Pending',
		approvalStatus: 'approved',
		billingStatus: 'payment_pending',
		paymentStatus: 'not_started',
		serviceStatus: 'waiting_for_payment',
		portalAccessStatus: 'locked_until_shortlisted_profiles_ready',
		noteTitle: 'Single requirement employer request approved. Payment pending.'
	};
}

export async function POST(req, context) {
	try {

        const actingUser = await getActingUser(req, { allowFallback: false });

		if (!['ADMINISTRATOR', 'DIRECTOR'].includes(actingUser?.role)) {
			return NextResponse.json(
				{ error: 'Employer request access required.' },
				{ status: 403 }
			);
		}

		const params = await context.params;
		const clientId = Number(params.clientId);

		if (!Number.isInteger(clientId) || clientId <= 0) {
			return NextResponse.json({ error: 'Invalid client id.' }, { status: 400 });
		}

		const body = await req.json().catch(() => ({}));
		const action = cleanText(body.action);

		if (!['approve', 'reject', 'mark_paid', 'mark_portal_ready'].includes(action)) {
			return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
		}

		const existingClient = await prisma.client.findUnique({
                where: { id: clientId },
                select: {
                    id: true,
                    name: true,
                    divisionId: true,
                    ownerId: true,
                    customFields: true
                }
                });

		if (!existingClient) {
			return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
		}
        if (action === 'approve' && (!existingClient.divisionId || !existingClient.ownerId)) {
        return NextResponse.json(
            { error: 'Assign division and owner before approving this employer request.' },
            { status: 400 }
        );
        }

		const currentCustomFields =
			existingClient.customFields && typeof existingClient.customFields === 'object'
				? existingClient.customFields
				: {};

		const selectedPlan = currentCustomFields.selectedPlan || 'single_requirement';
		const selectedPlanLabel =
			currentCustomFields.selectedPlanLabel ||
			(selectedPlan === 'end_to_end' ? 'End-to-End Hiring' : 'Single Requirement Hiring');

		const updated = getUpdatedFields(action, selectedPlan);


        const paymentValidation = normalizePaymentDetails(body.paymentDetails, action);

        if (paymentValidation.error) {
            return NextResponse.json({ error: paymentValidation.error }, { status: 400 });
        }

        const paymentDetails = paymentValidation.paymentDetails
            ? {
                    ...paymentValidation.paymentDetails,
                    recordedAt: new Date().toISOString(),
                    recordedByUserId: actingUser.id
                }
            : null;

		const nextCustomFields = {
			...currentCustomFields,
			selectedPlan,
			selectedPlanLabel,
			approvalStatus: updated.approvalStatus,
			billingStatus: updated.billingStatus,
			paymentStatus: updated.paymentStatus,
			serviceStatus: updated.serviceStatus,
			portalAccessStatus: updated.portalAccessStatus,
			lastAdminAction: action,
            lastAdminActionAt: new Date().toISOString(),
            ...(paymentDetails ? { paymentDetails } : {})
		};

		const result = await prisma.$transaction(async (tx) => {
			const client = await tx.client.update({
				where: { id: clientId },
				data: {
					status: updated.clientStatus,
					customFields: nextCustomFields
				}
			});

			await tx.clientNote.create({
				data: {
					recordId: createRecordId('client_note'),
					clientId: client.id,
					content: [
                        updated.noteTitle,
                        `Action: ${action}`,
                        `Selected Plan: ${selectedPlanLabel}`,
                        `Client Status: ${updated.clientStatus}`,
                        `Approval Status: ${updated.approvalStatus}`,
                        `Billing Status: ${updated.billingStatus}`,
                        `Payment Status: ${updated.paymentStatus}`,
                        ...(paymentDetails
                            ? [
                                    `Payment Amount: ₹${paymentDetails.amount}`,
                                    `Payment Mode: ${paymentDetails.mode}`,
                                    `Payment Reference: ${paymentDetails.referenceId || '-'}`,
                                    `Payment Received Date: ${paymentDetails.receivedDate}`,
                                    `Payment Notes: ${paymentDetails.notes || '-'}`
                                ]
                            : []),
                        `Service Status: ${updated.serviceStatus}`,
                        `Portal Access Status: ${updated.portalAccessStatus}`
                    ].join('\n')
				}
			});

			return client;
		});

		return NextResponse.json({
			ok: true,
			clientId: result.id,
			status: result.status
		});
	} catch (error) {
		console.error('[admin-employer-request-status]', error);

		return NextResponse.json(
			{ error: 'Unable to update employer request.' },
			{ status: 500 }
		);
	}
}