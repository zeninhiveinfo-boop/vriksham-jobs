#!/usr/bin/env node
/* eslint-disable no-console */

require('./load-env.cjs');

const path = require('node:path');
const { unlink, readdir, stat } = require('node:fs/promises');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseArgs(argv) {
	const args = new Set(argv.slice(2));
	return {
		delete: args.has('--delete'),
		json: args.has('--json')
	};
}

function getLocalStorageRoot() {
	return process.env.LOCAL_STORAGE_ROOT || path.join(process.cwd(), '.local-storage');
}

function normalizeStorageKey(value) {
	return String(value || '')
		.trim()
		.replace(/\\/g, '/')
		.replace(/^\/+/, '');
}

async function collectFiles(rootDirectory) {
	const files = [];
	const pending = [rootDirectory];

	while (pending.length > 0) {
		const currentDirectory = pending.pop();
		const entries = await readdir(currentDirectory, { withFileTypes: true });

		for (const entry of entries) {
			const absolutePath = path.join(currentDirectory, entry.name);
			if (entry.isDirectory()) {
				pending.push(absolutePath);
				continue;
			}
			if (!entry.isFile()) continue;

			const fileStats = await stat(absolutePath);
			files.push({
				absolutePath,
				sizeBytes: Number(fileStats.size || 0)
			});
		}
	}

	return files;
}

function sumBytes(items) {
	return items.reduce((total, item) => total + Number(item?.sizeBytes || 0), 0);
}

function formatBytes(value) {
	const bytes = Number(value || 0);
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
	return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function sampleKeys(items, limit = 15) {
	return items.slice(0, limit).map((item) => item.storageKey);
}

async function main() {
	const options = parseArgs(process.argv);
	const localStorageRoot = path.resolve(getLocalStorageRoot());
	const candidateRoot = path.join(localStorageRoot, 'candidates');

	const diskFiles = (await collectFiles(candidateRoot)).map((file) => ({
		...file,
		storageKey: normalizeStorageKey(path.relative(localStorageRoot, file.absolutePath))
	}));

	const attachmentRows = await prisma.candidateAttachment.findMany({
		where: {
			storageProvider: 'local',
			storageKey: {
				startsWith: 'candidates/'
			}
		},
		select: {
			id: true,
			storageKey: true,
			sizeBytes: true,
			fileName: true,
			candidateId: true,
			isResume: true
		}
	});

	const referencedByKey = new Map(
		attachmentRows.map((row) => [normalizeStorageKey(row.storageKey), row])
	);
	const diskByKey = new Map(diskFiles.map((file) => [file.storageKey, file]));

	const orphanFiles = diskFiles.filter((file) => !referencedByKey.has(file.storageKey));
	const missingFiles = attachmentRows
		.map((row) => ({
			...row,
			storageKey: normalizeStorageKey(row.storageKey)
		}))
		.filter((row) => !diskByKey.has(row.storageKey));
	const referencedFiles = diskFiles.filter((file) => referencedByKey.has(file.storageKey));
	const seedFiles = diskFiles.filter((file) => file.storageKey.includes('/seed/'));
	const inboundEmailFiles = diskFiles.filter((file) => file.storageKey.includes('/inbound-email/'));

	let deletedCount = 0;
	let deletedBytes = 0;
	let deleteErrors = 0;

	if (options.delete) {
		for (const file of orphanFiles) {
			try {
				await unlink(file.absolutePath);
				deletedCount += 1;
				deletedBytes += Number(file.sizeBytes || 0);
			} catch {
				deleteErrors += 1;
			}
		}
	}

	const report = {
		localStorageRoot,
		candidateRoot,
		mode: options.delete ? 'delete' : 'audit',
		db: {
			referencedAttachmentRows: attachmentRows.length,
			missingFiles: missingFiles.length
		},
		disk: {
			totalFiles: diskFiles.length,
			totalBytes: sumBytes(diskFiles),
			referencedFiles: referencedFiles.length,
			referencedBytes: sumBytes(referencedFiles),
			orphanFiles: orphanFiles.length,
			orphanBytes: sumBytes(orphanFiles),
			seedFiles: seedFiles.length,
			seedBytes: sumBytes(seedFiles),
			inboundEmailFiles: inboundEmailFiles.length,
			inboundEmailBytes: sumBytes(inboundEmailFiles)
		},
		deleteResult: {
			deletedCount,
			deletedBytes,
			deleteErrors
		},
		samples: {
			orphanFiles: sampleKeys(orphanFiles),
			missingFiles: sampleKeys(missingFiles)
		}
	};

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}

	console.log(`[candidate-local-storage] Root: ${localStorageRoot}`);
	console.log(`[candidate-local-storage] Mode: ${report.mode}`);
	console.log(`[candidate-local-storage] DB referenced attachments: ${report.db.referencedAttachmentRows}`);
	console.log(`[candidate-local-storage] DB rows missing on disk: ${report.db.missingFiles}`);
	console.log(`[candidate-local-storage] Disk files under candidates/: ${report.disk.totalFiles} (${formatBytes(report.disk.totalBytes)})`);
	console.log(
		`[candidate-local-storage] Referenced on disk: ${report.disk.referencedFiles} (${formatBytes(report.disk.referencedBytes)})`
	);
	console.log(
		`[candidate-local-storage] Orphaned on disk: ${report.disk.orphanFiles} (${formatBytes(report.disk.orphanBytes)})`
	);
	console.log(
		`[candidate-local-storage] Seed files on disk: ${report.disk.seedFiles} (${formatBytes(report.disk.seedBytes)})`
	);
	console.log(
		`[candidate-local-storage] Inbound email files on disk: ${report.disk.inboundEmailFiles} (${formatBytes(report.disk.inboundEmailBytes)})`
	);

	if (options.delete) {
		console.log(
			`[candidate-local-storage] Deleted orphaned files: ${report.deleteResult.deletedCount} (${formatBytes(report.deleteResult.deletedBytes)})`
		);
		console.log(`[candidate-local-storage] Delete errors: ${report.deleteResult.deleteErrors}`);
	} else {
		console.log('[candidate-local-storage] Dry run only. Re-run with --delete to remove orphaned files.');
	}

	if (report.samples.orphanFiles.length > 0) {
		console.log('[candidate-local-storage] Sample orphaned files:');
		for (const fileKey of report.samples.orphanFiles) {
			console.log(`  - ${fileKey}`);
		}
	}

	if (report.samples.missingFiles.length > 0) {
		console.log('[candidate-local-storage] Sample DB rows missing on disk:');
		for (const fileKey of report.samples.missingFiles) {
			console.log(`  - ${fileKey}`);
		}
	}
}

main()
	.catch((error) => {
		console.error('[candidate-local-storage] Failed.');
		console.error(error?.message || error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
