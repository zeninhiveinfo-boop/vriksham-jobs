export function extractIndianMobileDigits(value) {
	if (!value) return '';
	let str = String(value).trim();

	// Strip leading +91 prefix if present
	if (str.startsWith('+91')) {
		str = str.slice(3).trim();
	}

	let digits = str.replace(/\D/g, '');
	if (!digits) return '';

	// Handle 12-digit numbers starting with 91 (e.g. 919876543210)
	if (digits.length >= 12 && digits.startsWith('91')) {
		digits = digits.slice(2);
	}
	// Handle 11-digit numbers starting with 0 (e.g. 09876543210)
	else if (digits.length === 11 && digits.startsWith('0')) {
		digits = digits.slice(1);
	}

	return digits.slice(0, 10);
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

