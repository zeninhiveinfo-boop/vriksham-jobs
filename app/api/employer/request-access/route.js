import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createRecordId } from '@/lib/record-id';
import { isValidEmailAddress } from '@/lib/email-validation';
import { isValidOptionalHttpUrl } from '@/lib/url-validation';
import { enforceMutationThrottle } from '@/lib/mutation-throttle';
import {
	EMPLOYER_REQUEST_MIN_FORM_FILL_SECONDS,
	EMPLOYER_REQUEST_RATE_LIMIT_MAX_REQUESTS,
	EMPLOYER_REQUEST_RATE_LIMIT_WINDOW_SECONDS
} from '@/lib/security-constants';

const HONEYPOT_FIELD = 'faxNumber';
const FORM_STARTED_AT_FIELD = 'startedAtMs';
const MAX_REQUEST_BODY_BYTES = 64 * 1024;
const DUPLICATE_WINDOW_HOURS = 24;

const optionalText = (maxLength) => z.string().trim().max(maxLength).optional().or(z.literal(''));
const employerRequestSchema = z.object({
	companyName: z.string().trim().min(1, 'Company name is required.').max(160),
	contactPerson: z.string().trim().min(1, 'Contact person is required.').max(160),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.max(254)
		.refine((value) => isValidEmailAddress(value), 'A valid work email is required.'),
	phone: optionalText(40),
	website: optionalText(500).refine((value) => isValidOptionalHttpUrl(value), 'Enter a valid company website URL.'),
	industry: optionalText(120),
	city: optionalText(120),
	state: optionalText(120),
	zipCode: optionalText(20),
	hiringLocation: optionalText(240),
	hiringRequirement: z.string().trim().min(1, 'Hiring requirement is required.').max(5000),
	selectedPlan: z.enum(['single_requirement', 'end_to_end']).default('single_requirement'),
	[HONEYPOT_FIELD]: optionalText(200),
	[FORM_STARTED_AT_FIELD]: z.union([z.string(), z.number()]).optional()
});

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

function firstValidationMessage(error) {
	return error?.issues?.[0]?.message || 'Check the submitted details and try again.';
}

function isOversizedRequest(req) {
	const contentLength = Number(req.headers.get('content-length') || 0);
	return Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES;
}

function looksAutomated(input) {
	if (cleanText(input?.[HONEYPOT_FIELD])) return true;

	const startedAtMs = Number(input?.[FORM_STARTED_AT_FIELD]);
	if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return true;
	const elapsedMs = Date.now() - startedAtMs;
	return elapsedMs < EMPLOYER_REQUEST_MIN_FORM_FILL_SECONDS * 1000 || elapsedMs > 24 * 60 * 60 * 1000;
}

function successResponse() {
	return NextResponse.json({
		ok: true,
		message: 'Request submitted successfully.'
	});
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
		const throttleResponse = await enforceMutationThrottle(req, 'employer.request_access.post', {
			maxRequests: EMPLOYER_REQUEST_RATE_LIMIT_MAX_REQUESTS,
			windowSeconds: EMPLOYER_REQUEST_RATE_LIMIT_WINDOW_SECONDS,
			message: 'Too many employer requests from this network. Please try again later.'
		});
		if (throttleResponse) return throttleResponse;

		if (isOversizedRequest(req)) {
			return NextResponse.json({ error: 'Request payload is too large.' }, { status: 413 });
		}

		const body = await req.json().catch(() => null);
		const parsed = employerRequestSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: firstValidationMessage(parsed.error) }, { status: 400 });
		}
		if (looksAutomated(parsed.data)) {
			return successResponse();
		}

		const {
			companyName,
			contactPerson,
			email,
			phone,
			website,
			industry,
			city,
			state,
			zipCode,
			hiringLocation,
			hiringRequirement,
			selectedPlan
		} = parsed.data;

		const planConfig = getPlanConfig(selectedPlan);

		const { firstName, lastName } = splitName(contactPerson);
		const duplicateCutoff = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000);
		const existingRequest = await prisma.client.findFirst({
			where: {
				status: 'Pending Approval',
				createdAt: { gte: duplicateCutoff },
				contacts: { some: { email } }
			},
			select: { id: true }
		});
		if (existingRequest) {
			return successResponse();
		}

		await prisma.$transaction(async (tx) => {
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

		});

		return successResponse();
	} catch (error) {
		console.error('[employer-request-access]', error);

		return NextResponse.json(
			{ error: 'Unable to submit request right now. Please try again.' },
			{ status: 500 }
		);
	}
}
