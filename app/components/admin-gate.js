'use client';

import { useEffect, useMemo, useState } from 'react';
import LoadingIndicator from '@/app/components/loading-indicator';
import { roleLabel } from '@/app/constants/access-control-options';

export default function AdminGate({
	children,
	allowedRoles = ['ADMINISTRATOR'],
	title = 'Admin Access Required',
	message
}) {
	const [state, setState] = useState({ loading: true, allowed: false, role: '' });

	const normalizedAllowedRoles = useMemo(
		() => (Array.isArray(allowedRoles) && allowedRoles.length > 0 ? allowedRoles : ['ADMINISTRATOR']),
		[allowedRoles]
	);

	useEffect(() => {
		let cancelled = false;

		async function checkAccess() {
			const res = await fetch('/api/session/acting-user', { cache: 'no-store' });
			if (!res.ok) {
				if (!cancelled) {
					setState({ loading: false, allowed: false, role: '' });
				}
				return;
			}

			const data = await res.json().catch(() => ({}));
			const role = data?.user?.role || '';
			const allowed = normalizedAllowedRoles.includes(role);

			if (!cancelled) {
				setState({ loading: false, allowed, role });
			}
		}

		checkAccess();

		return () => {
			cancelled = true;
		};
	}, [normalizedAllowedRoles]);

	if (state.loading) {
		return (
			<section className="module-page">
				<LoadingIndicator className="page-loading-indicator" label="Checking access" />
			</section>
		);
	}

	if (!state.allowed) {
		const allowedRoleLabels = normalizedAllowedRoles.map((role) => roleLabel(role)).join(' or ');

		return (
			<section className="module-page">
				<article className="panel panel-narrow">
					<h3>{title}</h3>
					<p className="panel-subtext">
						{message || `This area is only available for ${allowedRoleLabels}.`}
					</p>
				</article>
			</section>
		);
	}

	return children;
}