'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './request-access.module.css';

const emptyForm = {
	companyName: '',
	contactPerson: '',
	email: '',
	phone: '',
	website: '',
	industry: '',
	hiringLocation: '',
	city: '',
	state: '',
	zipCode: '',
	hiringRequirement: '',
	selectedPlan: 'single_requirement'
};

export default function EmployerRequestAccessPage() {
	const [form, setForm] = useState(emptyForm);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	function updateField(field, value) {
		setForm((current) => ({
			...current,
			[field]: value
		}));
	}

	async function submitRequest(event) {
		event.preventDefault();

		setSaving(true);
		setSuccess('');
		setError('');

		const res = await fetch('/api/employer/request-access', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			setError(data.error || 'Unable to submit request. Please try again.');
			setSaving(false);
			return;
		}

		setSuccess('Your request has been submitted. Our team will contact you shortly.');
		setForm(emptyForm);
		setSaving(false);
	}

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<Link href="/" className={styles.brand}>
					<div className={styles.logo}>V</div>
					<div>
						<strong>Vriksham Jobs</strong>
						<span>Employer access request</span>
					</div>
				</Link>

				<nav>
					<Link href="/careers">Browse Jobs</Link>
					<Link href="/login?next=/admin">Admin Login</Link>
				</nav>
			</header>

			<section className={styles.hero}>
				<div className={styles.intro}>
					<p className={styles.badge}>For employers</p>
					<h1>Request access to hire through Vriksham Jobs.</h1>
					<p>
						Share your company and hiring requirement details. Our team will review your request,
						approve your employer account, and help you activate the right hiring plan.
					</p>

					<div className={styles.flow}>
						<div>
							<span>01</span>
							<strong>Submit company details</strong>
							<p>Tell us about your organization and hiring needs.</p>
						</div>
						<div>
							<span>02</span>
							<strong>Vriksham verifies</strong>
							<p>Our team reviews and approves eligible employers.</p>
						</div>
						<div>
							<span>03</span>
							<strong>Start receiving talent</strong>
							<p>Post requirements and review shortlisted candidates.</p>
						</div>
					</div>
				</div>

				<form className={styles.form} onSubmit={submitRequest}>
					<h2>Employer Request Form</h2>
					<p>Submit your company details and our team will review your access request.</p>

					<div className={styles.planSection}>
						<label
							className={
								form.selectedPlan === 'single_requirement'
									? `${styles.planCard} ${styles.planCardActive}`
									: styles.planCard
							}
						>
							<input
								type="radio"
								name="selectedPlan"
								value="single_requirement"
								checked={form.selectedPlan === 'single_requirement'}
								onChange={(event) => updateField('selectedPlan', event.target.value)}
							/>

							<span>Single Requirement Hiring</span>
							<strong>For one specific job requirement</strong>
							<p>
								Submit one hiring requirement. After admin approval and payment,
								Vriksham starts screening candidates and shares shortlisted profiles
								through the client portal when ready.
							</p>
						</label>

						<label
							className={
								form.selectedPlan === 'end_to_end'
									? `${styles.planCard} ${styles.planCardActive}`
									: styles.planCard
							}
						>
							<input
								type="radio"
								name="selectedPlan"
								value="end_to_end"
								checked={form.selectedPlan === 'end_to_end'}
								onChange={(event) => updateField('selectedPlan', event.target.value)}
							/>

							<span>End-to-End Hiring</span>
							<strong>Custom managed hiring support</strong>
							<p>
								Vriksham manages the hiring process from screening to interview
								coordination and hiring support. Our sales team will contact you
								with custom pricing.
							</p>
						</label>
					</div>

					<div className={styles.grid}>
						<label>
							Company Name
							<input
								type="text"
								placeholder="ABC Technologies Pvt Ltd"
								value={form.companyName}
								onChange={(event) => updateField('companyName', event.target.value)}
								required
							/>
					</label>

						<label>
							Contact Person
							<input
								type="text"
								placeholder="Ravi Kumar"
								value={form.contactPerson}
								onChange={(event) => updateField('contactPerson', event.target.value)}
								required
							/>
						</label>

						<label>
							Work Email
							<input
								type="email"
								placeholder="ravi@company.com"
								value={form.email}
								onChange={(event) => updateField('email', event.target.value)}
								required
							/>
						</label>

						<label>
							Phone Number
							<input
								type="tel"
								placeholder="+91 98765 43210"
								value={form.phone}
								onChange={(event) => updateField('phone', event.target.value)}
							/>
						</label>

						<label>
							Company Website
							<input
								type="url"
								placeholder="https://company.com"
								value={form.website}
								onChange={(event) => updateField('website', event.target.value)}
							/>
						</label>

						<label>
							Industry
							<input
								type="text"
								placeholder="Technology, Healthcare, Manufacturing..."
								value={form.industry}
								onChange={(event) => updateField('industry', event.target.value)}
							/>
						</label>

						<label>
							Hiring Location
							<input
								type="text"
								placeholder="Bengaluru, Mangalore, Remote..."
								value={form.hiringLocation}
								onChange={(event) => updateField('hiringLocation', event.target.value)}
							/>
						</label>

						<label>
							City
							<input
								type="text"
								placeholder="Mangalore"
								value={form.city}
								onChange={(event) => updateField('city', event.target.value)}
							/>
						</label>

						<label>
							State
							<input
								type="text"
								placeholder="Karnataka"
								value={form.state}
								onChange={(event) => updateField('state', event.target.value)}
							/>
						</label>

						<label>
							PIN Code
							<input
								type="text"
								placeholder="575001"
								value={form.zipCode}
								onChange={(event) => updateField('zipCode', event.target.value)}
							/>
						</label>
					</div>

					<label>
						Hiring Requirement
						<textarea
							rows="5"
							placeholder="Example: We need 3 frontend developers with 2-4 years of React experience..."
							value={form.hiringRequirement}
							onChange={(event) => updateField('hiringRequirement', event.target.value)}
							required
						/>
					</label>

					<button type="submit" disabled={saving}>
						{saving ? 'Submitting...' : 'Submit Request'}
					</button>

					{success ? <span className={styles.success}>{success}</span> : null}
					{error ? <span className={styles.error}>{error}</span> : null}
				</form>
			</section>
		</main>
	);
}