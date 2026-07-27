export const CURRENT_CTC_BAND_OPTIONS = Object.freeze([
	{ value: 'UP_TO_1_5_LPA', label: '₹0–1.5 LPA' },
	{ value: 'FROM_1_5_TO_2_5_LPA', label: '₹1.5–2.5 LPA' },
	{ value: 'FROM_2_5_TO_3_5_LPA', label: '₹2.5–3.5 LPA' },
	{ value: 'FROM_3_5_LPA', label: '₹3.5 LPA and above' }
]);

export const CURRENT_CTC_BAND_VALUES = Object.freeze(
	CURRENT_CTC_BAND_OPTIONS.map((option) => option.value)
);

export function currentCtcBandLabel(value) {
	const normalized = String(value || '').trim();
	if (!normalized) return '';
	return (
		CURRENT_CTC_BAND_OPTIONS.find((option) => option.value === normalized)?.label ||
		normalized
	);
}
