'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './employer-requests.module.css';

export default function EmployerRequestActions({
	clientId,
	status,
	selectedPlan,
	assignmentReady = false,
	jobOrderCount = 0
}) {
	const router = useRouter();
	const [saving, setSaving] = useState('');
	const [paymentOpen, setPaymentOpen] = useState(false);

	const today = new Date().toISOString().slice(0, 10);
	const [paymentDetails, setPaymentDetails] = useState({
		amount: '',
		mode: 'UPI',
		referenceId: '',
		receivedDate: today,
		notes: ''
	});

	function updatePaymentField(key, value) {
		setPaymentDetails((current) => ({ ...current, [key]: value }));
	}

	async function updateStatus(action, extraBody = {}) {
		let message = 'Update this employer request?';

		if (action === 'approve') {
			message = 'Approve this employer request?';
		}

		if (action === 'reject') {
			message = 'Reject this employer request?';
		}

		if (action === 'mark_paid') {
			const amountNumber = Number(String(paymentDetails.amount || '').replace(/,/g, ''));

			if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
				alert('Enter a valid payment amount.');
				return;
			}

			if (!paymentDetails.receivedDate) {
				alert('Enter the payment received date.');
				return;
			}

			message = 'Record this payment and start hiring for this employer request?';
		}

		if (action === 'mark_portal_ready') {
			message = 'Mark shortlisted profiles as ready for employer review?';
		}

		if (!window.confirm(message)) return;

		setSaving(action);

		const res = await fetch(`/api/admin/employer-requests/${clientId}/status`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action, ...extraBody })
		});

		setSaving('');

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			alert(data.error || 'Unable to update request.');
			return;
		}

		router.refresh();
	}

	const isPendingApproval = status === 'Pending Approval';
	const isPaymentPending = status === 'Approved - Payment Pending';
	const isHiringInProgress = status === 'Hiring In Progress';
	const isPortalReady = status === 'Client Portal Ready';
	const isRejected = status === 'Rejected' || status === 'Rejected Employer';

	const showAssignmentHint = isPendingApproval && !assignmentReady;
	const showApproveReject = isPendingApproval && assignmentReady;
	const showMarkPaid = isPaymentPending;
	const showCreateRequirement = isHiringInProgress && jobOrderCount === 0;
	const showMarkPortalReady = isHiringInProgress && jobOrderCount > 0;
	const showCompleted = isPortalReady;
	const showRejected = isRejected;

	return (
		<div className={styles.actionGroup}>
			{showAssignmentHint ? (
				<span className={styles.assignmentActionHint}>Assign division/owner first</span>
			) : null}

			{showApproveReject ? (
				<>
					<button
						type="button"
						className={styles.approveButton}
						onClick={() => updateStatus('approve')}
						disabled={Boolean(saving)}
					>
						{saving === 'approve' ? 'Approving...' : 'Approve'}
					</button>

					<button
						type="button"
						className={styles.rejectButton}
						onClick={() => updateStatus('reject')}
						disabled={Boolean(saving)}
					>
						{saving === 'reject' ? 'Rejecting...' : 'Reject'}
					</button>
				</>
			) : null}

			{showMarkPaid ? (
				<>
					<button
						type="button"
						className={styles.markPaidButton}
						onClick={() => setPaymentOpen((current) => !current)}
						disabled={Boolean(saving)}
					>
						{paymentOpen ? 'Hide payment form' : 'Record Payment'}
					</button>

					{paymentOpen ? (
						<div className={styles.paymentBox}>
							<label>
								<span>Amount Received *</span>
								<input
									value={paymentDetails.amount}
									onChange={(event) => updatePaymentField('amount', event.target.value)}
									placeholder="5000"
									inputMode="decimal"
								/>
							</label>

							<label>
								<span>Payment Mode *</span>
								<select
									value={paymentDetails.mode}
									onChange={(event) => updatePaymentField('mode', event.target.value)}
								>
									<option value="UPI">UPI</option>
									<option value="Bank Transfer">Bank Transfer</option>
									<option value="Cash">Cash</option>
									<option value="Cheque">Cheque</option>
									<option value="Other">Other</option>
								</select>
							</label>

							<label>
								<span>Reference / Transaction ID</span>
								<input
									value={paymentDetails.referenceId}
									onChange={(event) => updatePaymentField('referenceId', event.target.value)}
									placeholder="UPI / bank reference"
								/>
							</label>

							<label>
								<span>Received Date *</span>
								<input
									type="date"
									value={paymentDetails.receivedDate}
									onChange={(event) => updatePaymentField('receivedDate', event.target.value)}
								/>
							</label>

							<label className={styles.paymentBoxFull}>
								<span>Payment Notes</span>
								<textarea
									rows={3}
									value={paymentDetails.notes}
									onChange={(event) => updatePaymentField('notes', event.target.value)}
									placeholder="Optional notes about this payment"
								/>
							</label>

							<button
								type="button"
								className={styles.markPaidButton}
								onClick={() => updateStatus('mark_paid', { paymentDetails })}
								disabled={Boolean(saving)}
							>
								{saving === 'mark_paid' ? 'Saving Payment...' : 'Save Payment & Start Hiring'}
							</button>
						</div>
					) : null}
				</>
			) : null}

			{showCreateRequirement ? (
				<Link
					href={`/job-orders/new?clientId=${clientId}`}
					className={styles.jobOrderButton}
				>
					Create Requirement
				</Link>
			) : null}

			{showMarkPortalReady ? (
				<button
					type="button"
					className={styles.portalReadyButton}
					onClick={() => updateStatus('mark_portal_ready')}
					disabled={Boolean(saving)}
				>
					{saving === 'mark_portal_ready' ? 'Updating...' : 'Mark Portal Ready'}
				</button>
			) : null}

			{showCompleted ? (
				<span className={styles.assignmentReadyBadge}>Portal ready</span>
			) : null}

			{showRejected ? (
				<span className={styles.assignmentActionHint}>Rejected</span>
			) : null}
		</div>
	);
}
