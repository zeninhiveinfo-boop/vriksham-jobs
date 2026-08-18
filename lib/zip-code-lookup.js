export function normalizeZipCode(value) {
	if (!value) return '';
	const digits = String(value).replace(/\D/g, '');
	return digits.slice(0, 6);
}

function hasText(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

export async function withInferredCityStateFromZip(db, input) {
	const base = input && typeof input === 'object' ? { ...input } : {};
	const normalizedZip = normalizeZipCode(base.zipCode);
	if (!normalizedZip) {
		return base;
	}

	base.zipCode = normalizedZip;
	if (hasText(base.city) && hasText(base.state)) {
		return base;
	}

	const zipRecord = await db.zipCode.findFirst({
		where: { zip: normalizedZip },
		orderBy: { id: 'asc' },
		select: {
			primaryCity: true,
			state: true
		}
	});
	if (!zipRecord) {
		return base;
	}

	if (!hasText(base.city)) {
		base.city = zipRecord.primaryCity || base.city;
	}
	if (!hasText(base.state)) {
		base.state = zipRecord.state || base.state;
	}

	return base;
}
