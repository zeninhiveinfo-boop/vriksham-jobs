import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function hasDatabaseConnection() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch {
		return false;
	}
}

export async function GET() {
	const databaseAvailable = await hasDatabaseConnection();
	const health = {
		timestamp: new Date().toISOString(),
		version: process.env.npm_package_version || '0.1.0',
		service: 'Vriksham Jobs',
		ok: databaseAvailable
	};
	return NextResponse.json(health, {
		status: databaseAvailable ? 200 : 503,
		headers: {
			'Cache-Control': 'no-store'
		}
	});
}
