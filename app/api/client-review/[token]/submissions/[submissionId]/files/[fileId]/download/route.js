import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { downloadObjectBuffer } from '@/lib/object-storage';
import { loadClientPortalAccessByToken } from '@/lib/client-portal';
import { getSystemBranding } from '@/lib/system-settings';
import { consumeRequestThrottle } from '@/lib/request-throttle';
import {
	CLIENT_PORTAL_RATE_LIMIT_MAX_REQUESTS,
	CLIENT_PORTAL_RATE_LIMIT_WINDOW_SECONDS
} from '@/lib/security-constants';

import { withApiLogging } from '@/lib/api-logging';

const PRIVATE_DOWNLOAD_HEADERS = {
	'Cache-Control': 'no-store',
	'Referrer-Policy': 'no-referrer',
	'X-Robots-Tag': 'noindex, nofollow',
	'X-Content-Type-Options': 'nosniff'
};

function privateJson(body, init = {}) {
	return NextResponse.json(body, {
		...init,
		headers: {
			...PRIVATE_DOWNLOAD_HEADERS,
			...(init.headers || {})
		}
	});
}

function quotedFileName(fileName) {
	return String(fileName || 'attachment')
		.replace(/[\r\n"]/g, '')
		.trim();
}

async function getClient_review_token_submissions_submissionid_files_fileid_downloadHandler(req, { params }) {
	try {
		const throttle = await consumeRequestThrottle({
			req,
			routeKey: 'client_review.download.get',
			maxRequests: CLIENT_PORTAL_RATE_LIMIT_MAX_REQUESTS,
			windowSeconds: CLIENT_PORTAL_RATE_LIMIT_WINDOW_SECONDS
		});
		if (!throttle.allowed) {
			return privateJson(
				{ error: 'Too many download requests. Please try again shortly.' },
				{
					status: 429,
					headers: { 'Retry-After': String(throttle.retryAfterSeconds || 60) }
				}
			);
		}

		const branding = await getSystemBranding();
		if (!branding.clientPortalEnabled) {
			return privateJson({ error: 'File not found.' }, { status: 404 });
		}
		const awaitedParams = await params;
		const token = String(awaitedParams?.token || '').trim();
		const submissionId = Number(awaitedParams?.submissionId);
		const fileId = Number(awaitedParams?.fileId);
		if (!token || !Number.isInteger(submissionId) || submissionId <= 0 || !Number.isInteger(fileId) || fileId <= 0) {
			return privateJson({ error: 'File not found.' }, { status: 404 });
		}

		const portalAccess = await loadClientPortalAccessByToken(token);
		if (!portalAccess) {
			return privateJson({ error: 'Client review portal not found.' }, { status: 404 });
		}

		const attachment = await prisma.candidateAttachment.findFirst({
			where: {
				id: fileId,
				isResume: true,
				candidate: {
					submissions: {
						some: {
							id: submissionId,
							jobOrderId: portalAccess.jobOrderId
						}
					}
				}
			}
		});
		if (!attachment) {
			return privateJson({ error: 'File not found.' }, { status: 404 });
		}

		const buffer = await downloadObjectBuffer({
			key: attachment.storageKey,
			storageProvider: attachment.storageProvider,
			storageBucket: attachment.storageBucket
		});
		const fileName = quotedFileName(attachment.fileName);
		return new NextResponse(buffer, {
			status: 200,
			headers: {
				...PRIVATE_DOWNLOAD_HEADERS,
				'Content-Type': attachment.contentType || 'application/octet-stream',
				'Content-Length': String(buffer.length),
				'Content-Disposition': `attachment; filename="${fileName}"`
			}
		});
	} catch (error) {
		if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404 || error?.code === 'ENOENT') {
			return privateJson({ error: 'File not found in storage.' }, { status: 404 });
		}
		return privateJson({ error: 'Failed to download file.' }, { status: 500 });
	}
}

export const GET = withApiLogging(
	'client_review.token.submissions.submissionid.files.fileid.download.get',
	getClient_review_token_submissions_submissionid_files_fileid_downloadHandler
);
