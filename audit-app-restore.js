const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let fail = 0;
let warn = 0;

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function bad(msg) {
  console.log(`❌ ${msg}`);
  fail++;
}

function note(msg) {
  console.log(`⚠️  ${msg}`);
  warn++;
}

function section(title) {
  console.log('\n==================================================');
  console.log(title);
  console.log('==================================================');
}

function exists(file) {
  return fs.existsSync(file);
}

section('1. Git state');

try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  const head = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
  console.log(`Branch: ${branch}`);
  console.log(`HEAD: ${head}`);
  ok('Git is readable');
} catch (error) {
  bad('Git is not healthy');
}

try {
  const deleted = execSync("git status --short | grep '^ D' || true", { encoding: 'utf8' }).trim();
  if (deleted) {
    console.log(deleted);
    bad('There are deleted tracked files');
  } else {
    ok('No deleted tracked files');
  }
} catch {
  bad('Could not check deleted files');
}

section('2. Important Employer Request files');

const required = [
  'app/admin/employer-requests/page.js',
  'app/admin/employer-requests/employer-request-actions.js',
  'app/admin/employer-requests/employer-requests.module.css',
  'app/api/admin/employer-requests/[clientId]/status/route.js',
  'app/employer/request-access/page.js',
  'app/employer/request-access/request-access.module.css',
  'app/api/employer/request-access/route.js',
];

for (const file of required) {
  if (exists(file)) ok(`${file} exists`);
  else bad(`${file} missing`);
}

section('3. CSS module mismatch scan');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(item)) out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const jsFiles = walk('app').filter(file => /\.(js|jsx|ts|tsx)$/.test(file));
let cssMismatchCount = 0;

for (const file of jsFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const importMatches = [...text.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+['"](.+?\.module\.css)['"]/g)];

  for (const match of importMatches) {
    const importName = match[1];
    const cssPath = path.normalize(path.join(path.dirname(file), match[2]));

    if (!fs.existsSync(cssPath)) {
      bad(`${file} imports missing CSS module: ${cssPath}`);
      continue;
    }

    const usedRegex = new RegExp(`${importName}\\.([A-Za-z0-9_]+)`, 'g');
    const used = [...new Set([...text.matchAll(usedRegex)].map(m => m[1]))].sort();

    const cssText = fs.readFileSync(cssPath, 'utf8');
    const defined = [...new Set([...cssText.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)\s*[{,]/g)].map(m => m[1]))].sort();

    const missing = used.filter(name => !defined.includes(name));

    if (missing.length) {
      cssMismatchCount++;
      console.log('\nFile:', file);
      console.log('CSS:', cssPath);
      console.log('Missing classes:', missing.join(', '));
    }
  }
}

if (cssMismatchCount === 0) ok('No CSS module class mismatches found');
else bad(`${cssMismatchCount} CSS module mismatch group(s) found`);

section('4. Employer Request action logic inspection');

const actionsFile = 'app/admin/employer-requests/employer-request-actions.js';
if (exists(actionsFile)) {
  const text = fs.readFileSync(actionsFile, 'utf8');

  const keywords = [
    'Approve',
    'Reject',
    'Mark',
    'paid',
    'Portal',
    'Create Requirement',
    'Assign division',
    'assignmentReady',
    'jobOrderCount',
  ];

  for (const word of keywords) {
    if (text.includes(word)) ok(`Action file contains "${word}"`);
    else note(`Action file does not contain "${word}"`);
  }

  const buttonCount = (text.match(/<button/g) || []).length;
  const formCount = (text.match(/<form/g) || []).length;

  console.log(`button tags: ${buttonCount}`);
  console.log(`form tags: ${formCount}`);

  if (buttonCount + formCount === 0) {
    bad('EmployerRequestActions appears to render no buttons/forms');
  }
}

section('5. Admin Employer Requests page action component usage');

const adminPage = 'app/admin/employer-requests/page.js';
if (exists(adminPage)) {
  const text = fs.readFileSync(adminPage, 'utf8');

  if (text.includes('<EmployerRequestActions')) ok('Admin page renders EmployerRequestActions');
  else bad('Admin page does not render EmployerRequestActions');

  const props = ['clientId', 'status', 'selectedPlan', 'assignmentReady', 'jobOrderCount'];
  for (const prop of props) {
    if (text.includes(prop + '=')) ok(`Admin page passes ${prop}`);
    else note(`Admin page may not pass ${prop}`);
  }
}

section('6. Backup comparison availability');

const backupRoots = [
  '../hire-gnome-ats-safety-backup-20260522-223533',
  '../hire-gnome-ats-backup-before-git-recovery-20260522-223951',
  '../hire-gnome-ats-broken-git-20260522-224426',
  '../hire-gnome-ats-backup-before-git-recovery-20260522-224318',
];

for (const root of backupRoots) {
  if (exists(root)) {
    ok(`Backup folder exists: ${root}`);
    for (const file of required) {
      const backupFile = path.join(root, file);
      if (exists(backupFile)) {
        const size = fs.statSync(backupFile).size;
        console.log(`  found ${file} (${size} bytes)`);
      }
    }
  }
}

section('7. Final result');

console.log(`Failures: ${fail}`);
console.log(`Warnings: ${warn}`);

if (fail > 0) {
  console.log('\n❌ Audit failed. Do not commit yet.');
  process.exit(1);
}

console.log('\n✅ Audit passed. Still manually check UI pages before commit.');
