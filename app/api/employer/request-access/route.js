import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRecordId } from '@/lib/record-id';

function cleanText(value) {
	return String(value || '').trim();
}

function splitName(fullName) {
	const cleaned = cleanText(fullName);

	if (!cleaned) {
		return { firstName: 'Unknown', lastName: 'Contact' };
	}

	const parts = cleaned.split(/\s+/);

	if (parts.length === 1) {
		return { firstName: parts[0], lastName: 'Contact' };
	}

	return {
		firstName: parts[0],
		lastName: parts.slice(1).join(' ')
	};
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function getPlanConfig(selectedPlan) {
	if (selectedPlan === 'end_to_end') {
		return {
			selectedPlan: 'end_to_end',
			selectedPlanLabel: 'End-to-End Hiring',
			approvalStatus: 'pending_sales_review',
			billingStatus: 'custom_pricing_required',
			paymentStatus: 'custom_pricing',
			serviceStatus: 'sales_followup_required',
			portalAccessStatus: 'manual'
		};
	}

	return {
		selectedPlan: 'single_requirement',
		selectedPlanLabel: 'Single Requirement Hiring',
		approvalStatus: 'pending_approval',
		billingStatus: 'approval_required',
		paymentStatus: 'not_started',
		serviceStatus: 'not_started',
		portalAccessStatus: 'locked_until_shortlisted_profiles_ready'
	};
}

export async function POST(req) {
	try {
		const body = await req.json();

		const companyName = cleanText(body.companyName);
		const contactPerson = cleanText(body.contactPerson);
		const email = cleanText(body.email).toLowerCase();
		const phone = cleanText(body.phone);
		const website = cleanText(body.website);
        const industry = cleanText(body.industry);
        const city = cleanText(body.city);
        const state = cleanText(body.state);
        const zipCode = cleanText(body.zipCode);
		const hiringLocation = cleanText(body.hiringLocation);
		const hiringRequirement = cleanText(body.hiringRequirement);
		const selectedPlan = cleanText(body.selectedPlan) || 'single_requirement';

		const planConfig = getPlanConfig(selectedPlan);

		if (!companyName) {
			return NextResponse.json(
				{ error: 'Company name is required.' },
				{ status: 400 }
			);
		}

		if (!contactPerson) {
			return NextResponse.json(
				{ error: 'Contact person is required.' },
				{ status: 400 }
			);
		}

		if (!email || !isValidEmail(email)) {
			return NextResponse.json(
				{ error: 'A valid work email is required.' },
				{ status: 400 }
			);
		}

		if (!hiringRequirement) {
			return NextResponse.json(
				{ error: 'Hiring requirement is required.' },
				{ status: 400 }
			);
		}

		const { firstName, lastName } = splitName(contactPerson);

		const result = await prisma.$transaction(async (tx) => {
			const client = await tx.client.create({
				data: {
					recordId: createRecordId('client'),
					name: companyName,
					status: 'Pending Approval',
					phone: phone || null,
					website: website || null,
                    industry: industry || null,
                    city: city || null,
                    state: state || null,
                    zipCode: zipCode || null,
					description: [
						'Employer request submitted from Vriksham Jobs public request-access form.',
						hiringLocation ? `Hiring location: ${hiringLocation}` : null
					]
						.filter(Boolean)
						.join('\n\n'),
					customFields: {
						employerRequest: true,
						selectedPlan: planConfig.selectedPlan,
						selectedPlanLabel: planConfig.selectedPlanLabel,
						approvalStatus: planConfig.approvalStatus,
						billingStatus: planConfig.billingStatus,
						paymentStatus: planConfig.paymentStatus,
						serviceStatus: planConfig.serviceStatus,
						portalAccessStatus: planConfig.portalAccessStatus,
						requestSource: 'website',
						hiringLocation: hiringLocation || null
					}
				}
			});

			const contact = await tx.contact.create({
				data: {
					recordId: createRecordId('contact'),
					firstName,
					lastName,
					email,
					phone: phone || null,
					title: 'Employer Request Contact',
					source: 'Vriksham Website',
					clientId: client.id,
					customFields: {
						employerRequest: true,
						selectedPlan: planConfig.selectedPlan,
						selectedPlanLabel: planConfig.selectedPlanLabel
					}
				}
			});

			await tx.clientNote.create({
				data: {
					recordId: createRecordId('client_note'),
					clientId: client.id,
					content: [
						'New employer access request received from website.',
						`Company: ${companyName}`,
						`Selected Plan: ${planConfig.selectedPlanLabel}`,
						`Approval Status: ${planConfig.approvalStatus}`,
						`Billing Status: ${planConfig.billingStatus}`,
						`Payment Status: ${planConfig.paymentStatus}`,
						`Service Status: ${planConfig.serviceStatus}`,
						`Portal Access Status: ${planConfig.portalAccessStatus}`,
						`Contact: ${contactPerson}`,
						`Email: ${email}`,
						phone ? `Phone: ${phone}` : null,
						website ? `Website: ${website}` : null,
                        industry ? `Industry: ${industry}` : null,
                        city ? `City: ${city}` : null,
                        state ? `State: ${state}` : null,
                        zipCode ? `PIN Code: ${zipCode}` : null,
						hiringLocation ? `Hiring Location: ${hiringLocation}` : null,
						'',
						'Hiring Requirement:',
						hiringRequirement
					]
						.filter((line) => line !== null)
						.join('\n')
				}
			});

			await tx.contactNote.create({
				data: {
					recordId: createRecordId('contact_note'),
					contactId: contact.id,
					noteType: 'employer_request',
					content: [
						'Employer request contact created from website.',
						`Company: ${companyName}`,
						`Selected Plan: ${planConfig.selectedPlanLabel}`,
						`Email: ${email}`,
						phone ? `Phone: ${phone}` : null
					]
						.filter((line) => line !== null)
						.join('\n')
				}
			});

			return {
				clientId: client.id,
				contactId: contact.id,
				selectedPlan: planConfig.selectedPlan
			};
		});

		return NextResponse.json({
			ok: true,
			message: 'Employer request submitted successfully.',
			...result
		});
	} catch (error) {
		console.error('[employer-request-access]', error);

		return NextResponse.json(
			{ error: 'Unable to submit request right now. Please try again.' },
			{ status: 500 }
		);
	}
}