export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import EmployerRequestActions from './employer-request-actions';
import styles from './employer-requests.module.css';

const EMPLOYER_REQUEST_STATUSES = [
	'Pending Approval',
	'Approved - Payment Pending',
	'Hiring In Progress',
	'Client Portal Ready',
	'Rejected'
];

function readCustomField(record, key, fallback = '') {
	if (!record?.customFields || typeof record.customFields !== 'object') {
		return fallback;
	}

	const value = record.customFields[key];

	if (value === undefined || value === null || value === '') {
		return fallback;
	}

	return value;
}

function formatDate(value) {
	if (!value) return '-';

	return new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));
}

function formatPlan(client) {
	const selectedPlan = readCustomField(client, 'selectedPlan', 'single_requirement');

	return readCustomField(
		client,
		'selectedPlanLabel',
		selectedPlan === 'end_to_end' ? 'End-to-End Hiring' : 'Single Requirement Hiring'
	);
}

function formatPaymentStatus(client) {
	const status = readCustomField(client, 'paymentStatus', 'not_started');

	if (status === 'paid') return 'Paid';
	if (status === 'pending') return 'Pending';
	if (status === 'not_started') return 'Not started';

	return status;
}

function getEmployerEmail(client) {
	return client.email || readCustomField(client, 'email', '-');
}

function getOwnerName(client) {
	const name = `${client.ownerUser?.firstName || ''} ${client.ownerUser?.lastName || ''}`.trim();

	return name || client.ownerUser?.email || '-';
}

export default async function EmployerRequestsPage() {
	const allEmployerRequestCandidates = await prisma.client.findMany({
		select: {
			id: true,
			name: true,
			status: true,
			divisionId: true,
			ownerId: true,
			customFields: true,
			createdAt: true,
			updatedAt: true,
			division: {
				select: {
					id: true,
					name: true
				}
			},
			ownerUser: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true
				}
			},
			jobOrders: {
				select: {
					id: true
				}
			}
		},
		orderBy: {
			updatedAt: 'desc'
		}
	});

	const employerRequests = allEmployerRequestCandidates.filter((client) => {
		const requestType = readCustomField(client, 'requestType');
		const selectedPlan = readCustomField(client, 'selectedPlan');

		return (
			(EMPLOYER_REQUEST_STATUSES instanceof Set ? EMPLOYER_REQUEST_STATUSES.has(client.status) : EMPLOYER_REQUEST_STATUSES.includes(client.status)) ||
			requestType === 'employer_access' ||
			Boolean(selectedPlan)
		);
	});


	const totalRequests = employerRequests.length;
	const pendingApproval = employerRequests.filter((client) => client.status === 'Pending Approval').length;
	const paymentPending = employerRequests.filter((client) => client.status === 'Approved - Payment Pending').length;
	const activeHiring = employerRequests.filter((client) => client.status === 'Hiring In Progress').length;

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Employer intake</p>
					<h1>Employer Requests</h1>
					<p>
						Review employer signups, assign ownership, record payment, and move approved
						requests into hiring workflow.
					</p>
				</div>

				<Link href="/admin" className={styles.secondaryButton}>
					Back to Admin
				</Link>
			</header>

			<section className={styles.statsGrid}>
				<div className={styles.statCard}>
					<strong>{totalRequests}</strong>
					<span>Total requests</span>
				</div>

				<div className={styles.statCard}>
					<strong>{pendingApproval}</strong>
					<span>Pending approval</span>
				</div>

				<div className={styles.statCard}>
					<strong>{paymentPending}</strong>
					<span>Payment pending</span>
				</div>

				<div className={styles.statCard}>
					<strong>{activeHiring}</strong>
					<span>Hiring in progress</span>
				</div>
			</section>

			<section className={styles.card}>
				<div className={styles.cardHeader}>
					<div>
						<h2>Requests</h2>
						<p>Process new employer requests from registration to client portal readiness.</p>
					</div>
				</div>

				{employerRequests.length === 0 ? (
					<div className={styles.emptyState}>
						<h3>No employer requests yet</h3>
						<p>New employer request submissions will appear here.</p>
					</div>
				) : (
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Company</th>
									<th>Contact</th>
									<th>Status</th>
									<th>Plan</th>
									<th>Payment</th>
									<th>Assignment</th>
									<th>Updated</th>
									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{employerRequests.map((client) => {
									const selectedPlan = readCustomField(client, 'selectedPlan', 'single_requirement');
									const assignmentReady = Boolean(client.divisionId && client.ownerId);
									const jobOrderCount = client.jobOrders?.length || 0;

									return (
										<tr key={client.id}>
											<td>
												<div className={styles.companyCell}>
													<strong>{client.name}</strong>
													<span>ID: {client.id}</span>
													<Link href={`/clients/${client.id}`} className={styles.openButton}>
														Open client
													</Link>
												</div>
											</td>

											<td>
												<div className={styles.contactCell}>
													<strong>{getEmployerEmail(client)}</strong>
													<span>{client.phone || readCustomField(client, 'phone', '-')}</span>
												</div>
											</td>

											<td>
												<span className={styles.statusBadge}>{client.status || '-'}</span>
											</td>

											<td>
												<span className={styles.planBadge}>{formatPlan(client)}</span>
											</td>

											<td>{formatPaymentStatus(client)}</td>

											<td>
												<div className={styles.assignmentCell}>
													<span
														className={
															assignmentReady
																? styles.assignmentReadyBadge
																: styles.assignmentWarningBadge
														}
													>
														{assignmentReady ? 'Assigned' : 'Needs assignment'}
													</span>
													<span>
														{client.division?.name || 'No division'} · {getOwnerName(client)}
													</span>
												</div>
											</td>

											<td>{formatDate(client.updatedAt || client.createdAt)}</td>

											<td>
												<div className={styles.rowActions}>
													<EmployerRequestActions
														clientId={client.id}
														status={client.status}
														selectedPlan={selectedPlan}
														assignmentReady={assignmentReady}
														jobOrderCount={jobOrderCount}
													/>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}
