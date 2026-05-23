export const CLIENT_STATUS_OPTIONS = [
	{ value: 'Pending Approval', label: 'Pending Approval' },
	{ value: 'Approved - Payment Pending', label: 'Approved - Payment Pending' },
	{ value: 'Sales Follow-up Required', label: 'Sales Follow-up Required' },
	{ value: 'Payment Completed', label: 'Payment Completed' },
	{ value: 'Hiring In Progress', label: 'Hiring In Progress' },
	{ value: 'Client Portal Ready', label: 'Client Portal Ready' },
	{ value: 'Rejected Employer', label: 'Rejected Employer' },

	// Original Hire Gnome statuses kept for compatibility
	{ value: 'Prospect', label: 'Prospect' },
	{ value: 'Active', label: 'Active' },
	{ value: 'Active + Verified', label: 'Active + Verified' },
	{ value: 'Inactive', label: 'Inactive' }
];

const CLIENT_STATUS_VALUE_SET = new Set(CLIENT_STATUS_OPTIONS.map((option) => option.value));

export function normalizeClientStatusValue(value) {
	const status = typeof value === 'string' ? value.trim() : '';
	if (!status) return 'Prospect';
	if (CLIENT_STATUS_VALUE_SET.has(status)) return status;
	if (status.toLowerCase() === 'active + verfieid') return 'Active + Verified';
	return 'Prospect';
}