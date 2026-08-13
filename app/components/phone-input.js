'use client';

import { extractIndianMobileDigits, formatPhoneInput, formatTenDigitIndianPhone } from '@/lib/phone';

export default function PhoneInput({ value, onChange, className = '', placeholder = '98765 43210', ...props }) {
	const digits = extractIndianMobileDigits(value);
	const displayValue = formatTenDigitIndianPhone(digits);

	const handleChange = (e) => {
		const newDigits = extractIndianMobileDigits(e.target.value);
		if (!newDigits) {
			onChange('');
		} else {
			onChange(formatPhoneInput(newDigits));
		}
	};

	const handlePaste = (e) => {
		e.preventDefault();
		const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
		const pastedDigits = extractIndianMobileDigits(pastedText);
		if (!pastedDigits) {
			onChange('');
		} else {
			onChange(formatPhoneInput(pastedDigits));
		}
	};

	return (
		<div className={`phone-input-wrapper ${className}`.trim()}>
			<span className="phone-prefix">+91</span>
			<input
				{...props}
				type="tel"
				inputMode="numeric"
				autoComplete="tel"
				value={displayValue}
				onChange={handleChange}
				onPaste={handlePaste}
				placeholder={placeholder}
				maxLength={11}
			/>
		</div>
	);
}
