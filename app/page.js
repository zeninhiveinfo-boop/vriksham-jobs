import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
	return (
		<main className={styles.home}>
			<header className={styles.navbar}>
				<div className={`${styles.container} ${styles.navInner}`}>
					<Link href="/" className={styles.brand}>
						<div className={styles.logo}>V</div>
						<div>
							<p className={styles.brandTitle}>Vriksham Jobs</p>
							<p className={styles.brandSubtitle}>Managed recruitment platform</p>
						</div>
					</Link>

					<nav className={styles.navLinks}>
						<a href="#how-it-works">How it works</a>
						<a href="#candidates">Candidates</a>
						<a href="#employers">Employers</a>
						<a href="#plans">Hiring plans</a>
					</nav>

					<div className={styles.navActions}>
						<Link href="/careers" className={`${styles.btn} ${styles.btnLight}`}>
							Browse Jobs
						</Link>
						<Link href="/employer/request-access" className={`${styles.btn} ${styles.btnDark}`}>
							Hire Talent
						</Link>
					</div>
				</div>
			</header>

			<section className={styles.hero}>
				<div className={`${styles.container} ${styles.heroGrid}`}>
					<div>
						<p className={styles.pill}>Managed hiring support for employers and job seekers</p>
						<h1>Curated hiring, managed by real recruiters.</h1>
						<p className={styles.heroText}>
							Vriksham Jobs connects job seekers with verified employer requirements through a managed
							recruitment process. Candidates apply for free, while Vriksham screens, evaluates, and
							shortlists suitable profiles before employers review them.
						</p>

						<div className={styles.heroActions}>
							<Link href="/careers" className={`${styles.btn} ${styles.btnPrimary}`}>
								Browse Jobs
							</Link>
							<Link href="/employer/request-access" className={`${styles.btn} ${styles.btnOutline}`}>
								Request Hiring Support
							</Link>
						</div>

						<div className={styles.stats}>
							<div>
								<strong>Free</strong>
								<span>for job seekers</span>
							</div>
							<div>
								<strong>Screened</strong>
								<span>candidate shortlists</span>
							</div>
							<div>
								<strong>Managed</strong>
								<span>recruitment workflow</span>
							</div>
						</div>
					</div>

					<div className={styles.pipelineCard}>
						<div className={styles.pipelineDark}>
							<div className={styles.pipelineTop}>
								<div>
									<span>Vriksham Hiring Pipeline</span>
									<h2>Example Requirement</h2>
								</div>
								<p>Active</p>
							</div>

							<div className={styles.pipelineList}>
								<PipelineItem title="Applications Received" count="42" />
								<PipelineItem title="Vriksham Screening" count="18" />
								<PipelineItem title="Internal Evaluation" count="9" />
								<PipelineItem title="Shortlisted Profiles" count="4" />
								<PipelineItem title="Employer Review" count="3" muted />
							</div>
						</div>

						<div className={styles.infoGrid}>
							<div>
								<h3>Candidate-first process</h3>
								<p>Job seekers apply for free and are reviewed by the Vriksham recruitment team.</p>
							</div>
							<div>
								<h3>Employer-ready shortlists</h3>
								<p>Employers receive curated profiles instead of unfiltered applications.</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="how-it-works" className={`${styles.section} ${styles.white}`}>
				<div className={styles.container}>
					<div className={styles.sectionHeading}>
						<p className={styles.sectionLabel}>How it works</p>
						<h2>A controlled hiring flow for better quality.</h2>
						<span>
							Vriksham acts as the recruitment operations layer between job seekers and employers.
						</span>
					</div>

					<div className={styles.steps}>
						<StepCard
							number="01"
							title="Employer submits requirement"
							text="Companies share role details, hiring location, and the type of hiring support they need."
						/>
						<StepCard
							number="02"
							title="Vriksham reviews and approves"
							text="Our team verifies the employer request and assigns it to the right internal owner."
						/>
						<StepCard
							number="03"
							title="Candidates apply for free"
							text="Job seekers browse open jobs, submit their profile, and upload resumes without paying fees."
						/>
						<StepCard
							number="04"
							title="Employers review shortlisted talent"
							text="Only curated profiles are shared with employers through the client review portal."
						/>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={`${styles.container} ${styles.twoCol}`}>
					<div id="candidates" className={`${styles.panel} ${styles.panelGreen}`}>
						<p className={styles.sectionLabel}>For candidates</p>
						<h2>Find verified job opportunities.</h2>
						<p>
							Apply to open jobs, share your resume, and let Vriksham help match your profile with
							employer requirements.
						</p>
						<ul>
							<li>Free job applications</li>
							<li>Resume-based profile review</li>
							<li>Recruiter-screened opportunities</li>
						</ul>
						<Link href="/careers" className={`${styles.btn} ${styles.btnLight}`}>
							Browse Open Jobs
						</Link>
					</div>

					<div id="employers" className={`${styles.panel} ${styles.panelWhite}`}>
						<p className={styles.sectionLabel}>For employers</p>
						<h2>Receive shortlisted candidates, not raw resumes.</h2>
						<p>
							Submit your hiring requirement and Vriksham will review, screen, and shortlist suitable
							profiles before employer review.
						</p>
						<ul>
							<li>Single requirement hiring support</li>
							<li>End-to-end managed hiring option</li>
							<li>Shortlisted profile review portal</li>
						</ul>
						<Link href="/employer/request-access" className={`${styles.btn} ${styles.btnDark}`}>
							Request Employer Access
						</Link>
					</div>
				</div>
			</section>

			<section id="plans" className={`${styles.section} ${styles.pricing}`}>
				<div className={`${styles.container} ${styles.pricingGrid}`}>
					<div className={styles.pricingIntro}>
						<p className={styles.sectionLabel}>Hiring plans</p>
						<h2>Choose the right hiring path.</h2>
						<p>
							Candidates apply for free. Employers can request support based on whether they have one
							specific role or need Vriksham to manage the hiring process end to end.
						</p>
					</div>

					<div className={styles.priceCards}>
						<PriceCard
							title="Single Requirement Hiring"
							price="Request Based"
							text="For one specific job requirement. After approval and payment, Vriksham screens applicants and shares shortlisted profiles when ready."
							highlight
						/>
						<PriceCard
							title="End-to-End Hiring"
							price="Custom Pricing"
							text="For employers who want Vriksham to manage screening, coordination, interview support, and hiring follow-up."
						/>
					</div>
				</div>
			</section>

			<footer className={styles.footer}>
				<div className={`${styles.container} ${styles.footerInner}`}>
					<p>© {new Date().getFullYear()} Vriksham Jobs. All rights reserved.</p>
					<div>
						<Link href="/careers">Careers</Link>
						<Link href="/employer/request-access">Employer Request</Link>
						<Link href="/login?next=/admin">Admin Login</Link>
					</div>
				</div>
			</footer>
		</main>
	);
}

function PipelineItem({ title, count, muted = false }) {
	return (
		<div className={styles.pipelineItem}>
			<div>
				<span className={muted ? `${styles.dot} ${styles.dotMuted}` : styles.dot} />
				<p>{title}</p>
			</div>
			<strong>{count}</strong>
		</div>
	);
}

function StepCard({ number, title, text }) {
	return (
		<div className={styles.stepCard}>
			<span>{number}</span>
			<h3>{title}</h3>
			<p>{text}</p>
		</div>
	);
}

function PriceCard({ title, price, text, highlight = false }) {
	return (
		<div className={highlight ? `${styles.priceCard} ${styles.priceCardHighlight}` : styles.priceCard}>
			<h3>{title}</h3>
			<strong>{price}</strong>
			<p>{text}</p>
		</div>
	);
}