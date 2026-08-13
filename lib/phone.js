export function extractIndianMobileDigits(value) {
	if (!value) return '';
	let raw = String(value).trim().replace(/\D/g, '');
	if (!raw) return '';

	if (raw.length === 12 && raw.startsWith('91')) {
		raw = raw.slice(2);
	} else if (raw.length === 11 && raw.startsWith('0')) {
		raw = raw.slice(1);
	} else if (raw.length > 10 && raw.startsWith('91')) {
		raw = raw.slice(2);
	}

	return raw.slice(0, 10);
}

export function formatTenDigitIndianPhone(digits) {
	if (!digits) return '';
	const clean = String(digits).replace(/\D/g, '').slice(0, 10);
	if (clean.length <= 5) return clean;
	return `${clean.slice(0, 5)} ${clean.slice(5)}`;
}

export function formatPhoneInput(value) {
	const digits = extractIndianMobileDigits(value);
	if (!digits) return '';
	return `+91 ${formatTenDigitIndianPhone(digits)}`;
}

export function normalizePhoneNumber(value) {
	return formatPhoneInput(value);
}
