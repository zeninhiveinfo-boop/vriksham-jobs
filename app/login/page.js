'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FormField from '@/app/components/form-field';
import { useToast } from '@/app/components/toast-provider';
import useSystemBranding from '@/app/hooks/use-system-branding';
import styles from './login.module.css';

function LoginPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const toast = useToast();
	const branding = useSystemBranding();

	const nextPath = searchParams.get('next') || '/admin';

	const [form, setForm] = useState({
		email: '',
		password: ''
	});
	const [saving, setSaving] = useState(false);
	const [checkingSetup, setCheckingSetup] = useState(true);
	const [demoMode, setDemoMode] = useState(false);
	const [demoAccounts, setDemoAccounts] = useState([]);

	useEffect(() => {
		let cancelled = false;

		async function checkSetupState() {
			const res = await fetch('/api/onboarding/status', { cache: 'no-store' });
			const data = await res.json().catch(() => ({}));

			if (cancelled) return;

			setDemoMode(Boolean(data.demoMode));
			setDemoAccounts(Array.isArray(data.demoAccounts) ? data.demoAccounts : []);

			if (!res.ok) {
				setCheckingSetup(false);
				return;
			}

			if (data.needsOnboarding) {
				router.replace('/setup');
				return;
			}

			setCheckingSetup(false);
		}

		checkSetupState();

		return () => {
			cancelled = true;
		};
	}, [router]);

	async function onSubmit(event) {
		event.preventDefault();

		if (checkingSetup) return;

		if (!form.email.trim() || !form.password.trim()) {
			toast.error('Email and password are required.');
			return;
		}

		setSaving(true);

		const res = await fetch('/api/session/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			toast.error(data.error || 'Login failed. Check your credentials and try again.');
			setSaving(false);
			return;
		}

		router.replace(nextPath);
		router.refresh();
	}

	return (
		<main className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.left}>
					<Link href="/" className={styles.brand}>
						<div className={styles.logo}>V</div>
						<div className={styles.brandText}>
							<strong>Vriksham Jobs</strong>
							<span>Curated hiring platform</span>
						</div>
					</Link>

					<div className={styles.hero}>
						<p>Secure access</p>
						<h1>One platform for managed recruitment operations.</h1>
						<p className={styles.heroText}>
							Candidates apply freely, employers review shortlisted talent, and Vriksham admins
							manage the full recruitment workflow from screening to placement.
						</p>
					</div>

					<div className={styles.paths}>
						<Link href="/careers" className={styles.pathCard}>
							<strong>Candidate Access</strong>
							<span>Browse open jobs and apply through the Vriksham careers portal.</span>
						</Link>

						<Link href="/employer/request-access" className={styles.pathCard}>
							<strong>Employer Access</strong>
							<span>Employer portal access will be enabled for approved companies.</span>
						</Link>

						<Link href="/login?next=/admin" className={styles.pathCard}>
							<strong>Admin Access</strong>
							<span>Vriksham team members can sign in to manage hiring operations.</span>
						</Link>
					</div>
				</div>

				<div className={styles.right}>
					<article className={styles.formCard}>
						<div className={styles.formHeader}>
							<Link
								href="/"
								className={styles.brandLogoWrap}
								aria-label={`${branding.siteName} home`}
							>
								<img src={branding.logoUrl} alt={branding.siteName} className={styles.brandLogo} />
							</Link>

							<h2>Sign in</h2>
							<p>
								Use your approved Vriksham Jobs account to access the recruitment dashboard.
							</p>
						</div>

						{demoMode && demoAccounts.length > 0 ? (
							<div className={styles.demoBox}>
								<p className={styles.demoTitle}>Demo Credentials</p>
								<ul>
									{demoAccounts.map((account) => (
										<li key={account.label}>
											<strong>{account.label}:</strong> {account.email} / {account.password}
										</li>
									))}
								</ul>
							</div>
						) : null}

						<form onSubmit={onSubmit} className={styles.form}>
							<FormField label="Email" required>
								<input
									type="email"
									autoComplete="email"
									value={form.email}
									onChange={(event) =>
										setForm((current) => ({ ...current, email: event.target.value }))
									}
									required
								/>
							</FormField>

							<FormField label="Password" required>
								<input
									type="password"
									autoComplete="current-password"
									value={form.password}
									onChange={(event) =>
										setForm((current) => ({ ...current, password: event.target.value }))
									}
									required
								/>
							</FormField>

							<button type="submit" disabled={saving || checkingSetup} className={styles.submit}>
								{saving ? 'Signing in...' : checkingSetup ? 'Loading...' : 'Sign in'}
							</button>
						</form>

						<div className={styles.links}>
							<Link href="/forgot-password">Forgot password?</Link>
						</div>

						<p className={styles.backHome}>
							Looking for jobs? <Link href="/careers">Browse open roles</Link>
						</p>
					</article>
				</div>
			</section>
		</main>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<main className={styles.page}>
					<section className={styles.shell}>
						<div className={styles.right}>
							<article className={styles.formCard}>
								<p>Loading sign in...</p>
							</article>
						</div>
					</section>
				</main>
			}
		>
			<LoginPageContent />
		</Suspense>
	);
}