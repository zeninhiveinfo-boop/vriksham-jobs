"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
	ArrowRight,
	BadgeCheck,
	BriefcaseBusiness,
	CheckCircle2,
	ClipboardCheck,
	Eye,
	FileSearch,
	MailCheck,
	MessagesSquare,
	Network,
	Rocket,
	ShieldCheck,
	Sparkles,
	Timer,
	UserRoundSearch,
} from "lucide-react";
import styles from "./page.module.css";

const fadeUp = {
	hidden: { opacity: 0, y: 18 },
	visible: { opacity: 1, y: 0 },
};

const metrics = [
	["Free", "for candidates"],
	["Curated", "shortlists"],
	["Managed", "recruitment flow"],
];

const signalTiles = [
	{ icon: Network, label: "Every application stays tied to the right job" },
	{ icon: Eye, label: "Employers see only profiles recruiters promote" },
	{ icon: Timer, label: "Hiring teams review cleaner shortlists faster" },
];

const candidateCards = [
	["Aarav M.", "Sales Executive", "92% fit", "Ready for review"],
	["Nisha K.", "Healthcare Recruiter", "88% fit", "Screening call done"],
	["Dev R.", "Operations Lead", "84% fit", "Resume verified"],
];

const activity = [
	"Application received",
	"Resume reviewed",
	"Recruiter note added",
	"Shared with employer",
];

const operatingFlow = [
	{
		stage: "01",
		title: "Intake",
		text: "Public applications, employer requests, and resumes enter one managed recruitment flow.",
	},
	{
		stage: "02",
		title: "Screen",
		text: "Recruiters review fit, resume quality, notes, and readiness before a candidate moves forward.",
	},
	{
		stage: "03",
		title: "Promote",
		text: "Only selected submissions become client-visible for employer review and feedback.",
	},
	{
		stage: "04",
		title: "Close",
		text: "Interviews, offers, placements, and follow-up stay connected to the original requirement.",
	},
];

const orbitItems = [
	["01", "Application", "Candidate applies to one verified opening."],
	["02", "Screening", "Recruiters review resume quality and fit."],
	["03", "Promotion", "Ready profiles become employer-visible."],
	["04", "Decision", "Feedback, interviews, and placements stay connected."],
];

const roles = [
	{
		label: "For candidates",
		title: "Apply to verified openings without placement fees.",
		points: ["Browse open roles", "Upload your resume", "Get reviewed by recruiters"],
		href: "/careers",
		cta: "Browse jobs",
	},
	{
		label: "For employers",
		title: "Get screened profiles instead of raw resume volume.",
		points: ["Submit a hiring request", "Track shortlist readiness", "Review curated candidates"],
		href: "/employer/request-access",
		cta: "Request hiring support",
	},
];

const controlSignals = [
	{
		icon: BadgeCheck,
		label: "Employer verified",
		value: "Approved",
	},
	{
		icon: FileSearch,
		label: "Resume reviewed",
		value: "Quality checked",
	},
	{
		icon: MessagesSquare,
		label: "Feedback loop",
		value: "Portal ready",
	},
];

const handoffRows = [
	["Intake", "12", "New applications"],
	["Screening", "7", "Recruiter reviewed"],
	["Promoted", "4", "Client-visible"],
];

const finalSteps = [
	{ icon: UserRoundSearch, title: "Candidates apply", text: "Public jobs stay simple and focused." },
	{ icon: ClipboardCheck, title: "Recruiters qualify", text: "Profiles are screened before employer review." },
	{ icon: MailCheck, title: "Employers decide", text: "Shortlists, feedback, and interviews stay connected." },
];

export default function HomePage() {
	const reduceMotion = useReducedMotion();
	const transition = reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] };
	const orbitRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: orbitRef,
		offset: ["start end", "end start"],
	});
	const pathScale = useTransform(scrollYProgress, [0.12, 0.82], [0.08, 1]);
	const gateLift = useTransform(scrollYProgress, [0, 0.5, 1], [18, -12, 10]);

	return (
		<main className={styles.preview}>
			<div className={styles.ambientLayer} aria-hidden="true">
				<span />
				<span />
				<span />
			</div>
			<header className={styles.header}>
				<div className={styles.nav}>
					<Link href="/" className={styles.brand} aria-label="Vriksham Jobs home">
						<img src="/branding/vriksham-jobs.png" alt="" className={styles.logo} />
						<span>
							<strong>Vriksham Jobs</strong>
							<small>Managed recruitment platform</small>
						</span>
					</Link>

					<nav className={styles.links} aria-label="Landing page sections">
						<a href="#workflow">Workflow</a>
						<a href="#control-room">Control room</a>
						<a href="#audiences">Audiences</a>
						<a href="#plans">Plans</a>
					</nav>

					<div className={styles.actions}>
						<Link href="/careers" className={styles.secondaryAction}>
							Browse jobs
						</Link>
						<Link href="/employer/request-access" className={styles.primaryAction}>
							Hire talent
						</Link>
					</div>
				</div>
			</header>

			<section className={styles.hero}>
				<div className={styles.heroGrid}>
					<motion.div
						className={styles.heroCopy}
						initial="hidden"
						animate="visible"
						variants={fadeUp}
						transition={transition}
					>
						<p className={styles.kicker}>
							<Sparkles size={16} aria-hidden="true" />
							Recruiter-managed hiring, not resume dumping
						</p>
						<h1>Turn job applications into employer-ready shortlists.</h1>
						<p className={styles.lede}>
							Vriksham Jobs sits between candidates and employers as the operating layer for hiring:
							applications come in, recruiters screen them, and only ready profiles move forward.
						</p>

						<div className={styles.heroActions}>
							<Link href="/careers" className={styles.heroPrimary}>
								Find open jobs
								<ArrowRight size={18} aria-hidden="true" />
							</Link>
							<Link href="/employer/request-access" className={styles.heroSecondary}>
								Request hiring support
							</Link>
						</div>

						<div className={styles.metrics} aria-label="Vriksham Jobs highlights">
							{metrics.map(([value, label]) => (
								<div key={value}>
									<strong>{value}</strong>
									<span>{label}</span>
								</div>
							))}
						</div>
					</motion.div>

					<motion.div
						className={styles.commandCenter}
						initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 18 }}
						animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
						transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
					>
						<div className={styles.commandTop}>
							<div>
								<span>Recruiter workspace</span>
								<h2>Senior Sales Executive</h2>
							</div>
							<p>4 shortlisted</p>
						</div>

						<div className={styles.commandGrid}>
							<div className={styles.candidateStack}>
								{candidateCards.map(([name, role, match, status], index) => (
									<motion.div
										key={name}
										className={styles.candidateCard}
										initial={reduceMotion ? false : { opacity: 0, x: 18 }}
										animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
										transition={{ ...transition, delay: reduceMotion ? 0 : 0.18 + index * 0.08 }}
									>
										<div className={styles.avatar}>{name.charAt(0)}</div>
										<div>
											<strong>{name}</strong>
											<span>{role}</span>
										</div>
										<p>{match}</p>
										<small>{status}</small>
									</motion.div>
								))}
							</div>

							<div className={styles.activityRail}>
								<p>Pipeline motion</p>
								{activity.map((item, index) => (
									<div key={item} className={styles.activityItem}>
										<span>{index + 1}</span>
										<strong>{item}</strong>
									</div>
								))}
							</div>
						</div>

						<div className={styles.reviewCard}>
							<div className={styles.reviewIcon}>
								<ShieldCheck size={22} aria-hidden="true" />
							</div>
							<div>
								<strong>Client-visible only after review</strong>
								<span>Recruiters control which candidates reach employer review.</span>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			<section className={styles.signalBand} aria-label="Vriksham Jobs operating principles">
				<div className={styles.signalGrid}>
					{signalTiles.map((tile) => (
						<div key={tile.label}>
							<tile.icon size={20} aria-hidden="true" />
							<p>{tile.label}</p>
						</div>
					))}
				</div>
			</section>

			<section id="workflow" className={styles.section}>
				<div className={styles.sectionHeading}>
					<p>How it works</p>
					<h2>The product flow mirrors the real recruitment workflow.</h2>
				</div>

				<div className={styles.timeline}>
					{operatingFlow.map((item, index) => (
						<motion.article
							key={item.stage}
							initial={reduceMotion ? false : "hidden"}
							whileInView={reduceMotion ? undefined : "visible"}
							viewport={{ once: true, margin: "-80px" }}
							variants={fadeUp}
							transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.08 }}
						>
							<span>{item.stage}</span>
							<h3>{item.title}</h3>
							<p>{item.text}</p>
						</motion.article>
					))}
				</div>
			</section>

			<section ref={orbitRef} className={styles.orbitSection}>
				<div className={styles.orbitSticky}>
					<div className={styles.orbitCopy}>
						<p>Scroll the hiring path</p>
						<h2>Applications move through a controlled review path.</h2>
						<span>
							The visual flow below mirrors the product rule: nothing reaches an employer until
							Vriksham has reviewed and promoted it.
						</span>
					</div>

					<motion.div className={styles.flowScene}>
						<div className={styles.flowRail} aria-hidden="true">
							<motion.span
								style={reduceMotion ? undefined : { scaleY: pathScale }}
							/>
						</div>

						<div className={styles.flowRows}>
							{orbitItems.map(([number, title, text], index) => (
								<motion.article
									key={number}
									className={styles.flowCard}
									initial={reduceMotion ? false : { opacity: 0, x: -16 }}
									whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
									viewport={{ once: true, margin: "-80px" }}
									transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.06 }}
									whileHover={reduceMotion ? undefined : { x: 4 }}
								>
									<span>{number}</span>
									<div>
										<strong>{title}</strong>
										<p>{text}</p>
									</div>
								</motion.article>
							))}
						</div>

						<motion.div
							className={styles.flowGate}
							style={reduceMotion ? undefined : { y: gateLift }}
						>
							<img src="/branding/vriksham-jobs.png" alt="" />
							<strong>Vriksham Review Gate</strong>
							<span>only promoted profiles become employer-visible</span>
						</motion.div>
					</motion.div>
				</div>
			</section>

			<section id="control-room" className={`${styles.section} ${styles.controlRoom}`}>
				<motion.div
					className={styles.controlCopy}
					initial={reduceMotion ? false : { opacity: 0, y: 18 }}
					whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={transition}
				>
					<p>Recruitment control room</p>
					<h2>Every candidate moves through a visible decision lane.</h2>
					<span>
						Vriksham is not just a form and a database. It is a recruiter-led operating room where
						applications, screening, client visibility, and final feedback stay connected.
					</span>
				</motion.div>

				<motion.div
					className={styles.controlPanel}
					initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 18 }}
					whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ ...transition, delay: reduceMotion ? 0 : 0.08 }}
				>
					<div className={styles.controlBeam} aria-hidden="true" />
					<div className={styles.controlHeader}>
						<strong>Live handoff board</strong>
						<span>Client visibility locked</span>
					</div>

					<div className={styles.handoffBoard}>
						<div className={styles.handoffRows}>
							{handoffRows.map(([stage, count, detail], index) => (
								<motion.div
									key={stage}
									className={styles.handoffRow}
									initial={reduceMotion ? false : { opacity: 0, x: -12 }}
									whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ ...transition, delay: reduceMotion ? 0 : 0.12 + index * 0.08 }}
								>
									<span>{stage}</span>
									<strong>{count}</strong>
									<small>{detail}</small>
								</motion.div>
							))}
						</div>

						<div className={styles.handoffCard}>
							<img src="/branding/vriksham-jobs.png" alt="" />
							<strong>Promotion Gate</strong>
							<span>Only recruiter-approved submissions enter employer review.</span>
						</div>
					</div>

					<div className={styles.healthGrid}>
						{controlSignals.map((signal) => (
							<div key={signal.label}>
								<signal.icon size={19} aria-hidden="true" />
								<strong>{signal.label}</strong>
								<span>{signal.value}</span>
							</div>
						))}
					</div>
				</motion.div>
			</section>

			<section id="audiences" className={`${styles.section} ${styles.audienceSection}`}>
				<div className={styles.audienceHeading}>
					<p>Two sides, one managed flow</p>
					<h2>Candidates get clarity. Employers get control.</h2>
				</div>

				<div className={styles.roleGrid}>
					{roles.map((role, index) => (
						<motion.article
							key={role.label}
							className={styles.roleCard}
							initial={reduceMotion ? false : { opacity: 0, y: 18 }}
							whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.08 }}
						>
							<div className={styles.roleIcon}>
								{index === 0 ? (
									<UserRoundSearch size={22} aria-hidden="true" />
								) : (
									<BriefcaseBusiness size={22} aria-hidden="true" />
								)}
							</div>
							<p>{role.label}</p>
							<h2>{role.title}</h2>
							<ul>
								{role.points.map((point) => (
									<li key={point}>
										<CheckCircle2 size={18} aria-hidden="true" />
										{point}
									</li>
								))}
							</ul>
							<Link href={role.href}>
								{role.cta}
								<ArrowRight size={17} aria-hidden="true" />
							</Link>
							<div className={styles.roleTrace} aria-hidden="true">
								<span />
								<span />
								<span />
							</div>
						</motion.article>
					))}
				</div>
			</section>

			<section id="plans" className={`${styles.section} ${styles.planSection}`}>
				<div className={styles.planPanel}>
					<div>
						<p className={styles.kicker}>
							<Rocket size={16} aria-hidden="true" />
							Launch the hiring lane
						</p>
						<h2>Start with one role and let the workflow prove itself.</h2>
					</div>
					<div className={styles.launchRail}>
						{finalSteps.map((step, index) => (
							<motion.div
								key={step.title}
								initial={reduceMotion ? false : { opacity: 0, y: 14 }}
								whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-80px" }}
								transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.08 }}
							>
								<step.icon size={20} aria-hidden="true" />
								<strong>{step.title}</strong>
								<p>{step.text}</p>
							</motion.div>
						))}
					</div>

					<div className={styles.finalCtas}>
						<Link href="/employer/request-access" className={styles.heroPrimary}>
							Request hiring support
							<ArrowRight size={18} aria-hidden="true" />
						</Link>
						<Link href="/careers" className={styles.heroSecondary}>
							Browse open jobs
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
