import { redirect } from 'next/navigation';

export default async function CandidateFileDownloadRedirectPage({ params }) {
	const awaitedParams = await params;
	const candidateId = encodeURIComponent(String(awaitedParams?.id || ''));
	const fileId = encodeURIComponent(String(awaitedParams?.fileId || ''));

	redirect(`/api/candidates/${candidateId}/files/${fileId}/download`);
}
