# Vriksham Jobs — Application and Résumé Migration Handoff

Last updated: 4 August 2026 (Asia/Kolkata)

This document is the operating handoff for continuing the legacy résumé migration on a separate MacBook Pro with 48 GB unified memory. Read it completely before changing data. The migration contains personal information. Keep the repository, source résumés, extracted text, databases, backups, and logs private.

## 1. Objective and current decision

The goal is to migrate approximately 2,000+ legacy candidate résumés into the Vriksham Jobs ATS while:

- retaining the original résumé file as the candidate's downloadable primary résumé;
- extracting only facts supported by the source résumé;
- creating structured candidate, education, work-history, skill, contact, location, and searchable-text data;
- supporting Indian single names and initials without fake surname placeholders;
- preserving the production administrator and configuration/reference data;
- removing test users and operational test records before the final migration;
- keeping the public upload limit at 5 MB for new applicants, while allowing oversized legacy files through the controlled migration;
- backing up and verifying every destructive database or file operation.

Do **not** create normalized replacement PDFs for the final migration. Normalized PDFs were tested but the current decision is to upload the original files. OCR/extracted text is used for database enrichment and search, not as a replacement for the original résumé.

## 2. Repository and deployed application

- GitHub repository: `zeninhiveinfo-boop/vriksham-jobs`
- Local repository on the original Mac: `/Users/jeeva/Downloads/Vriksham-Jobs/hire-gnome-ats`
- Production domain: `https://vrikshamjobs.com`
- Framework: Next.js 16.2.12, React 19, Node.js 22 on Hostinger
- Database ORM: Prisma 6.19.x
- Database engine: MySQL
- Application version: 1.5.1
- Production deployment: Hostinger Node.js Web App connected to GitHub branch `main`
- Hostinger application directory observed previously: `/home/u310108218/domains/vrikshamjobs.com/nodejs`
- Hostinger web root/Passenger configuration: `/home/u310108218/domains/vrikshamjobs.com/public_html/.htaccess`
- Hostinger SSH: `ssh -p 65002 u310108218@145.79.213.65`

Never put SSH, database, session, email, object-storage, or OpenAI credentials in Git, this Markdown file, a prompt, or a log. Obtain current secrets from the owner or hPanel and place them only in protected environment variables/files. Several credentials were temporarily exposed during troubleshooting and should be considered rotated/rotatable.

### Relevant Git history

At handoff, the latest pushed commit is:

```text
5368f12 Support Indian candidate name formats
```

Recent relevant commits:

```text
70b9dc2 Reduce public resume upload limit to 5 MB
43227dd Fix PDF parsing runtime on Hostinger
64cf0f8 Harden public workflows and add candidate CTC bands
d7f669b Revert "Add Passenger-compatible Next.js server"
c162413 Apply logo color theme polish
```

The local worktree is intentionally dirty. At handoff it contains:

```text
 M .gitignore
 M scripts/db-backup.js
?? scripts/resume-migration/
```

Do not discard, reset, stage, commit, or push these changes blindly. Review each file first. The résumé migration directory is currently untracked and contains the migration implementation.

## 3. Application behavior relevant to candidates

The Prisma `Candidate` record contains:

- identity/contact: `firstName`, optional `lastName`, `email`, `phone`, `mobile`;
- pipeline: `status`, `source`, `owner`, `ownerId`, `divisionId`;
- current role: `currentJobTitle`, `currentEmployer`, `currentCtcBand`, `experienceYears`;
- location: `address`, `city`, `state`, `zipCode`, `country`;
- links: `website`, `linkedinUrl`;
- text: `skillSet`, `summary`, `resumeSearchText`;
- migration/review metadata in `customFields`;
- relations: `CandidateEducation`, `CandidateWorkExperience`, `CandidateSkill`, `CandidateAttachment`, `CandidateAiSummary`, and operational records.

The application profile-completeness calculation is implemented in `lib/candidate-completeness.js`. It considers identity, pipeline assignment, current role/location, links, résumé summary, skills, work history, education, primary résumé, and required custom fields. `CandidateAiSummary` is separate and does not directly increase the profile-completeness score.

The résumé download path is:

```text
/api/candidates/{candidateId}/files/{fileId}/download
```

Local-file download uses `lib/object-storage.js`. A database attachment with `storageProvider = local` resolves its `storageKey` beneath `LOCAL_STORAGE_ROOT` and reads the file from disk.

## 4. Storage design

Hostinger shows 50 GB plan disk storage. This is ordinary hosting filesystem/disk allocation, not a separate S3 object-storage bucket. The project uses it through the application's local storage provider.

Required production environment variable:

```env
LOCAL_STORAGE_ROOT=/absolute/path/selected/on/hostinger
```

Use the existing production value. If it must be recreated, choose a persistent directory outside replaceable deployment-build output, for example a protected directory under the account home. Confirm the actual value in hPanel before copying files. Do not assume a path.

Candidate files use paths similar to:

```text
candidates/migration/{16-character-source-hash}/{sanitized-original-file-name}
```

The database preserves the actual original filename in `CandidateAttachment.fileName`. The compact storage path avoids the MySQL `storageKey` length limit.

The public application upload limit remains 5 MB. The migration scripts copy legacy files directly and may include source files larger than 5 MB. Do not increase the public limit merely to migrate legacy files.

Before and after copying production files, run:

```bash
npm run storage:candidates:audit
```

Do not run `npm run storage:candidates:clean` until the audit is reviewed and both the database and storage have been backed up.

## 5. Local development database

The development database runs in Docker using `docker-compose.dev.yml`:

```text
container: hire-gnome-mysql
image: mysql:8.4
host: localhost
host port: 3307
database: ats
user: ats
```

Use `.env` locally. A typical local connection is:

```env
DATABASE_URL="mysql://ats:LOCAL_PASSWORD@localhost:3307/ats"
AUTH_APP_BASE_URL="http://localhost:3000"
LOCAL_STORAGE_ROOT="/absolute/path/to/repository/.local-storage"
```

Do not copy production secrets into the local `.env` unless absolutely necessary. Do not commit `.env`.

Start and validate:

```bash
npm install
npm run db:up
npx prisma generate
npx prisma migrate deploy
npm run dev
curl -f http://localhost:3000/api/health
```

The local app should be available at `http://localhost:3000`.

## 6. Production Hostinger report

### Hosting and deployment

- Domain: `vrikshamjobs.com`
- GitHub deployment branch: `main`
- Framework: Next.js
- Node version shown in hPanel: 22.x
- Build command: `npm run build:deploy`
- Start command: `npm run start`
- Output directory: `.next`
- Root directory: `./`
- Expected health URL: `https://vrikshamjobs.com/api/health`
- Latest known runtime after the deployment fixes returned HTTP 200 and logged Next.js 16.2.12 as ready.

Production environment variables include at least:

```text
DATABASE_URL
AUTH_APP_BASE_URL=https://vrikshamjobs.com
AUTH_SESSION_SECRET
CLIENT_PORTAL_SECRET
RATE_LIMIT_SECRET
EMAIL_TEST_MODE
EMAIL_TEST_RECIPIENT
LOCAL_STORAGE_ROOT
SKIP_SYSTEM_SETTINGS_DB_DURING_BUILD=true
```

Inspect hPanel for the complete current list. Never overwrite secrets with placeholders.

### Hostinger MySQL

The final working Hostinger database reported in hPanel was:

```text
database: u310108218_vriksham
user:     u310108218_jeeva
host:     localhost
port:     3306
website:  vrikshamjobs.com
```

The production Prisma URL must follow this form, with URL-encoded credentials:

```env
DATABASE_URL="mysql://u310108218_jeeva:URL_ENCODED_PASSWORD@localhost:3306/u310108218_vriksham"
```

Do not use that `localhost` URL from the new Mac. It is valid only inside Hostinger. For migration, copy scripts/data to Hostinger and run them over SSH, or use an SSH tunnel with a deliberately adapted guarded importer. The current guarded remote scripts expect execution on Hostinger.

Earlier Hostinger database authentication problems were resolved at the hosting/database layer. Do not change Prisma's provider from MySQL and do not switch the application to PostgreSQL for this migration.

### Last known production migration state

The 50-candidate pilot was previously copied into production before the later local enrichment work. At that time production had 50 candidates but no résumé attachments and no structured education/work-history rows. This must be treated as **last-known**, not current truth. Query production before any change.

The latest local pilot, by contrast, has:

```text
users: 1
administrators: 1 (zeninhive.info@gmail.com)
candidates: 50
candidate attachments: 50 original source files
education records: 77
work-experience records: 41
candidate skill links: 26
job orders: 0
interviews: 0
clients: 0
submissions: 0
```

All 50 local attachment files were SHA-256 checked and found byte-identical to their source files. The pilot originals total 40.58 MiB. The full collection was previously estimated at roughly 1.5 GB; regenerate the inventory for an authoritative current figure.

## 7. Source and migration workspace

Original source on the original Mac:

```text
/Users/jeeva/Downloads/Vriksham-Jobs/vriksham-resumes
```

Migration workspace inside the repository:

```text
.resume-migration/
├── extracted-text/
├── inventory/
│   ├── manifest.jsonl
│   ├── pilot.json
│   └── summary.json
├── normalized-pdfs/       # draft experiment; not final upload source
├── parsed-json/
├── reports/
├── review/
├── resume-staging.sqlite
└── tmp/
```

`.resume-migration/` contains PII and must remain outside Git. When moving to the new Mac, copy the source directory and migration workspace using encrypted storage or a trusted private transfer. Verify file counts and SHA-256 hashes after transfer.

## 8. Existing migration tools

Located under `scripts/resume-migration/`:

| Script | Purpose |
|---|---|
| `inventory.py` | Recursively inventories source files, hashes them, detects exact duplicates, records formats/sizes/categories, and selects a representative pilot. |
| `run_pilot.py` | Extracts native text and uses Tesseract OCR when native extraction is unusable. Produces parsed JSON but its original structuring logic is intentionally simple. |
| `extract-native.cjs` | Native extraction helper for supported document types. |
| `enrich_pilot.py` | Credit-free deterministic enrichment for summary, skills, education and work history. Conservative; requires review. |
| `apply_pilot_name_review.py` | Reapplies the manually reviewed Indian name corrections. |
| `audit_pilot.py` | Produces a PII-free aggregate audit report. |
| `generate_normalized_pdfs.py` | Creates technically verified draft PDFs. Not the chosen final attachment workflow. |
| `reset_and_import_pilot.cjs` | Guarded destructive import into only local `localhost/.../ats`; preserves the configured administrator and reference/configuration data, resets operational data, and copies original résumé attachments. |
| `import_remote_pilot.cjs` | Older Prisma remote candidate importer. **Incomplete for the current enriched dataset.** |
| `import_remote_pilot_mysql.cjs` | Older socket-based Hostinger importer. **Incomplete for the current enriched dataset.** |
| `generate_remote_pilot_sql.cjs` | Older SQL generator. **Incomplete for the current enriched dataset.** |

### Critical warning about remote scripts

The current versions of the three remote import tools do **not** import the latest structured education/work history or original attachment files/attachment rows. Do not run them unchanged for the final migration. Extend and test them first, or implement a new final importer with the safety requirements in section 12.

## 9. Extraction strategy for the 48 GB Mac

Use a staged pipeline. Do not invoke an expensive model once per résumé without first extracting, classifying, caching, and deduplicating.

### Stage A — inventory and deduplication

1. Copy source files read-only.
2. Run `inventory.py` against the copied source.
3. Verify total files, supported/unsupported formats, exact duplicates, total bytes, oversized files, and categories.
4. Use SHA-256 as the immutable source identity and cache key.
5. Never parse the same SHA-256 twice unless parser version changes.

Example:

```bash
python3 scripts/resume-migration/inventory.py \
  --source "/absolute/path/to/vriksham-resumes" \
  --workspace .resume-migration \
  --pilot-size 50
```

### Stage B — native extraction first

Prefer native text extraction because it is faster and more accurate than OCR:

- PDF with text layer: PDF text extraction;
- DOC/DOCX: Word extraction/conversion;
- PPTX: slide/native text and embedded images;
- image files and image-only/scanned PDF pages: OCR;
- use OCR only when text quality fails a measured threshold.

Recommended local dependencies:

```text
Tesseract OCR with English language data
Poppler (pdftotext, pdftoppm, pdfinfo)
LibreOffice headless
Python 3.12+
Node.js 22
Docker Desktop
```

### Stage C — OCR routing

On the 48 GB machine, a larger local OCR/document model may be evaluated, but maintain a deterministic fallback. Unlimited-OCR or another local vision/OCR model should be benchmarked against a labelled set before full use.

Create a benchmark of at least 50–100 representative files covering:

- native PDFs;
- scanned PDFs;
- résumé PDFs made entirely from images;
- DOC/DOCX;
- JPG/JPEG/PNG;
- PPTX;
- rotated, low-resolution, multi-column and table-heavy résumés;
- English text and names/addresses with Indian initials.

Measure contact accuracy, name accuracy, education/employment entity accuracy, date accuracy, hallucination rate, runtime, and peak memory. A larger model is useful only if it improves supported facts without inventing data.

### Stage D — local structured parsing

The parser output for every SHA-256 should use a versioned JSON contract containing:

```json
{
  "schemaVersion": 2,
  "parserVersion": "...",
  "source": {
    "sha256": "...",
    "relativePath": "...",
    "fileName": "...",
    "sizeBytes": 0,
    "contentType": "..."
  },
  "candidate": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "mobile": "",
    "currentJobTitle": "",
    "currentEmployer": "",
    "currentCtcBand": "",
    "experienceYears": null,
    "address": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "country": "India",
    "website": "",
    "linkedinUrl": "",
    "skillSet": "",
    "summary": ""
  },
  "parsedSkillNames": [],
  "educationRecords": [],
  "workExperienceRecords": [],
  "resumeSearchText": "",
  "review": {
    "status": "NEEDS_REVIEW",
    "warnings": [],
    "fieldEvidence": {},
    "fieldConfidence": {}
  }
}
```

Every extracted structured field should retain source evidence (page/line/span if possible), confidence, and parser version. Empty is preferable to fabricated data.

### Stage E — optional local LLM enrichment

Use a local LLM only after clean text exists. Batch/cache by SHA-256. Ask for strict JSON matching the contract and require evidence spans. Validate with JSON Schema/Zod. Reject or review any value not found or inferable from the source. Never let the model invent an email, employer, school, qualification, date, surname, location, experience duration, CTC, or skill.

Suggested workflow on 48 GB unified memory:

1. Start with a quantized 7B–14B instruction model for structuring clean extracted text.
2. Use a vision/OCR model only for files/pages where native extraction/Tesseract quality is inadequate.
3. Keep temperature low/deterministic.
4. Limit context to one résumé and its metadata.
5. Persist raw response, validated response, model ID, prompt version, timing, and confidence.
6. Retry only validation/extraction failures, not every record.
7. Review a statistically meaningful sample and every low-confidence record before database import.

Do not use any API key that appeared in earlier conversation history. Use a newly created/rotated key only if the owner later authorizes external processing. Résumés contain personal data, so confirm privacy and retention terms before sending them to any third party.

## 10. Name, email and data-quality rules

- `firstName` is required by the current application and must contain the person's actual detected/reviewed name.
- `lastName` may be empty. Do not add `Unknown`, `.`, `NA`, `Candidate`, or other placeholders.
- Preserve Indian initials. Display order is first name followed by second name/initials.
- Do not reverse names into surname-first order.
- Email is currently required and unique in the Prisma schema. Do not silently invent production email addresses. Records without email need a documented business decision before production import (schema/product change, manual research, or a clearly isolated migration identity that is never presented as a real address).
- Deduplicate using multiple signals: source SHA-256, normalized email, normalized mobile, and reviewed name/contact combinations. Never merge on name alone.
- `currentCtcBand` must use the application's accepted dropdown values and must remain empty unless supported/confirmed.
- Folder category can be retained as migration metadata but should not be presented as a verified current job title unless reviewed.
- Candidate summary must be grounded in the résumé. Separate it from on-demand `CandidateAiSummary`.

## 11. Pilot state and reproducible local import

The latest local pilot was produced without external AI credits. Results:

- 50 candidates;
- skills detected in 47 parsed records;
- 77 education records;
- 41 work-history records;
- 21 grounded résumé summaries;
- 50 original résumé attachments, byte-identical to source;
- average profile completeness approximately 72%;
- distribution: 11 Strong, 23 Good, 16 Needs Work.

The lower-completeness records generally have sparse or low-quality source data. Do not fill gaps merely to improve a score.

Before a local destructive pilot import:

```bash
npm run db:backup
node scripts/resume-migration/reset_and_import_pilot.cjs --confirm-local-reset=ats
```

The importer refuses non-local hosts and any database other than `ats`. It preserves only `zeninhive.info@gmail.com` among users, while keeping divisions, settings, skills, custom-field definitions and ZIP/reference data. It clears candidates, clients, contacts, jobs, interviews, submissions, offers, related activity, throttles and logs.

The original Mac's latest pre-import backup was:

```text
.backups/ats-backup-20260803-135940.sql
```

Create a fresh backup on the new machine; do not rely solely on that historical file.

## 12. Required final-production importer

Build a new final importer rather than expanding the hard-coded `EXPECTED_CANDIDATES = 50` pilot in place. It must support a reviewed manifest/dataset of variable size and use batches.

Mandatory behavior:

1. **Dry run by default.** Print target host/database, source count, duplicates, missing required fields, attachment total bytes, row counts and intended deletions.
2. **Explicit target guard.** Require exact production database `u310108218_vriksham`, exact host context, an explicit confirmation token, and preferably a migration-run ID.
3. **Production backup first.** Create and verify a MySQL dump and a filesystem archive/snapshot of the candidate storage directory.
4. **Preserve** `zeninhive.info@gmail.com`, divisions, system settings, skill catalogue, custom-field definitions and reference/ZIP data.
5. **Clear only approved operational scope.** Confirm with the owner immediately before deleting users/candidates/jobs/interviews/etc. The old pilot requested removal, but production state may have changed.
6. **Stage files before commit.** Copy originals into a migration staging directory under `LOCAL_STORAGE_ROOT`, verify SHA-256 and size, then atomically move/use final keys.
7. **Import all relations.** Candidate, `CandidateEducation`, `CandidateWorkExperience`, matching `CandidateSkill` links, and one primary `CandidateAttachment` pointing to the original file.
8. **Use original metadata.** Original filename, MIME type and size. Store source SHA-256/parser/review details in migration metadata.
9. **Batch transactions.** Use manageable batches (for example 50–200 candidates), checkpoints and idempotent migration IDs. A crash must be resumable without duplicates.
10. **Handle failures safely.** Keep foreign-key checks enabled whenever practical. If temporarily disabled, restore them in `finally`. Roll back the active batch and record the error.
11. **Never generate fake PII.** Block or quarantine unresolved records.
12. **Post-import reconciliation.** Database rows, filesystem objects, source manifest, byte counts and hashes must agree.

The final file upload and database import should be coordinated so users never see attachment rows whose files are absent. A safe order is:

1. upload to a temporary migration prefix;
2. verify hashes remotely;
3. back up production database;
4. import candidate and relation rows referencing final keys in batches;
5. move/copy staged files to final keys before each batch commit, or ensure the download path can access the staged key;
6. audit orphans/missing files;
7. restart the application only if required.

## 13. Hostinger deployment and migration procedure

### A. Preflight from the new Mac

```bash
git clone git@github.com:zeninhiveinfo-boop/vriksham-jobs.git
cd vriksham-jobs
git status
git log -1 --oneline
npm ci
npx prisma generate
npm run ci:preflight
npm run build
```

Copy the untracked migration tooling and private migration workspace separately from the original Mac. Do not push PII artifacts to GitHub.

### B. Verify production without mutation

```bash
curl -f https://vrikshamjobs.com/api/health
ssh -p 65002 u310108218@145.79.213.65
```

On Hostinger:

```bash
cd /home/u310108218/domains/vrikshamjobs.com/nodejs
node --version
npm --version
pwd
```

Inspect environment without printing secrets. For `DATABASE_URL`, print only hostname, database and username using a short script; never echo the password.

Verify MySQL locally on Hostinger:

```bash
mysql -h 127.0.0.1 -P 3306 -u u310108218_jeeva -p u310108218_vriksham -e "SELECT 1;"
```

If Hostinger's `localhost` resolves to `::1` and authentication differs, use the same working host form as the production `DATABASE_URL`; do not change application code to hide an account/grant problem.

### C. Production backup

Use the repository backup script if it is confirmed to work with Hostinger MySQL, or use `mysqldump` with credentials entered securely. Store the backup outside the deployment directory and verify that it is non-empty and restorable.

Also archive the production candidate-file storage tree. Do not proceed without both backup paths and sizes recorded in the migration report.

### D. Upload private migration package

Do not upload source résumés to the Git repository. Use `rsync`/`scp` over SSH into a private account directory. Prefer a manifest-driven staging directory. Ensure permissions prevent public web access.

Example shape (replace only paths, not credentials):

```bash
rsync -av --partial --progress -e "ssh -p 65002" \
  /absolute/private/migration-package/ \
  u310108218@145.79.213.65:/home/u310108218/private-resume-migration/
```

### E. Dry-run, import and audit

Run the new final importer in dry-run mode first. Review the report with the owner. Only then run the exact guarded commit command. After import:

```bash
npm run storage:candidates:audit
curl -f https://vrikshamjobs.com/api/health
```

Query and record at minimum:

```sql
SELECT COUNT(*) FROM Candidate;
SELECT COUNT(*) FROM CandidateAttachment;
SELECT COUNT(*) FROM CandidateEducation;
SELECT COUNT(*) FROM CandidateWorkExperience;
SELECT COUNT(*) FROM CandidateSkill;
SELECT COUNT(*) FROM JobOrder;
SELECT COUNT(*) FROM Interview;
SELECT COUNT(*) FROM Client;
SELECT COUNT(*) FROM Submission;
```

Randomly test at least 20 candidate pages and original-file downloads across every format, plus every oversized legacy file. Hash downloaded files against the source manifest.

### F. Restart versus redeploy

A data/files-only migration should not require a Git redeploy. Restart the Node.js app if runtime caches or environment values changed. Redeploy only when code/schema/migration changes were committed and reviewed. `prisma migrate deploy` applies pending schema migrations; it does not normally erase candidate data, but always back up first.

## 14. Acceptance criteria

The full migration is accepted only when all applicable checks pass:

- source manifest count and unique-content count are documented;
- every imported candidate maps to a reviewed source record;
- no placeholder first/last names;
- no invented PII or employment/education facts;
- duplicate policy applied and exceptions documented;
- original résumé exists, downloads, and matches source SHA-256;
- exactly one intended primary résumé per candidate, unless documented otherwise;
- education/work/skills counts reconcile with reviewed parsed JSON;
- search finds candidates using résumé content and structured fields;
- candidate profile, filters and downloads work in browser;
- administrator access works;
- division/director permissions are unchanged;
- public career application accepts files up to 5 MB and rejects larger new uploads;
- health endpoint returns 200;
- runtime logs show no migration-related errors;
- database and storage orphan audit is clean;
- production backup and rollback instructions are recorded;
- a PII-free aggregate migration report is saved.

## 15. Rollback

If production verification fails:

1. Stop further imports.
2. Preserve logs, the migration run report and failed batch state.
3. Restart/redeploy only if needed to stabilize the application.
4. Restore the verified database backup.
5. Restore the candidate storage archive or remove only files associated with the migration-run ID after validating exact paths.
6. Run health, row-count and storage audits.
7. Do not delete the source or migration workspace.

Never use broad destructive commands, wildcard deletion against account home, `git reset --hard`, or unguarded `DELETE`/`DROP` statements.

## 16. Immediate next steps for the new agent

1. Transfer and hash-verify the source résumé folder and `.resume-migration` workspace.
2. Clone the GitHub repository and separately copy the untracked migration scripts.
3. Run the 50-pilot pipeline and compare its audit to the counts in this document.
4. Benchmark native extraction + Tesseract against the chosen local OCR/vision model.
5. Create a reviewed schema-v2 parser with field evidence/confidence and caching.
6. Parse the full unique-content collection locally; do not import yet.
7. Produce PII-free aggregate quality and exception reports.
8. Human-review low-confidence/blocking records and a statistically meaningful high-confidence sample.
9. Implement and test the new variable-size final importer locally, including original attachments and all structured relations.
10. Restore a production backup into a disposable local database and rehearse the complete import/rollback.
11. Obtain explicit owner approval for the final deletion/import scope.
12. Back up Hostinger database/storage, upload private files, run dry-run, import in batches, audit and browser-test.

## 17. Security checklist

- Rotate any password/API key that has been pasted into chat or screenshots.
- Use SSH key authentication where possible.
- Keep migration files mode 0600/directories 0700 where practical.
- Do not log résumé text, emails, phone numbers, credentials or full database URLs.
- Encrypt portable media and backups containing résumés.
- Limit remote copies to the Hostinger account and approved operators.
- Remove temporary staging files only after verified completion and retention approval.
- Keep a documented retention/deletion policy for source résumés and backups.
- Do not send résumés to external AI services without explicit authorization and an approved privacy basis.

