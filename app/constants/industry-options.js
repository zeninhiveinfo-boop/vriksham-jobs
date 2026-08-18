export const INDUSTRY_OPTIONS = [
	{ value: 'Accounting, Tax & Audit Services', label: 'Accounting, Tax & Audit Services' },
	{ value: 'Automobile & Auto Components', label: 'Automobile & Auto Components' },
	{ value: 'Aviation & Airport Services', label: 'Aviation & Airport Services' },
	{ value: 'Banking & Financial Services', label: 'Banking & Financial Services' },
	{ value: 'BPO, Call Center & Customer Support', label: 'BPO, Call Center & Customer Support' },
	{ value: 'Chemical & Petrochemical', label: 'Chemical & Petrochemical' },
	{ value: 'Construction & Infrastructure', label: 'Construction & Infrastructure' },
	{ value: 'Consulting & Corporate Services', label: 'Consulting & Corporate Services' },
	{ value: 'Education & Training', label: 'Education & Training' },
	{ value: 'Electrical, Electronics & Hardware', label: 'Electrical, Electronics & Hardware' },
	{ value: 'Engineering & Technical Services', label: 'Engineering & Technical Services' },
	{ value: 'Entertainment, Media & Publishing', label: 'Entertainment, Media & Publishing' },
	{ value: 'Events & Event Management', label: 'Events & Event Management' },
	{ value: 'FMCG & Consumer Goods', label: 'FMCG & Consumer Goods' },
	{ value: 'Food & Beverage', label: 'Food & Beverage' },
	{ value: 'Food Processing & Manufacturing', label: 'Food Processing & Manufacturing' },
	{ value: 'Furniture & Interior Design', label: 'Furniture & Interior Design' },
	{ value: 'Healthcare & Hospitals', label: 'Healthcare & Hospitals' },
	{ value: 'Health, Beauty & Wellness', label: 'Health, Beauty & Wellness' },
	{ value: 'Hospitality, Hotels & Travel', label: 'Hospitality, Hotels & Travel' },
	{ value: 'IT & Information Technology', label: 'IT & Information Technology' },
	{ value: 'Insurance', label: 'Insurance' },
	{ value: 'Law & Legal Services', label: 'Law & Legal Services' },
	{ value: 'Logistics, Courier & Warehousing', label: 'Logistics, Courier & Warehousing' },
	{ value: 'Manufacturing & Industrial', label: 'Manufacturing & Industrial' },
	{ value: 'Maritime & Shipping Services', label: 'Maritime & Shipping Services' },
	{ value: 'Mining, Minerals & Quarrying', label: 'Mining, Minerals & Quarrying' },
	{ value: 'Oil & Gas & Energy', label: 'Oil & Gas & Energy' },
	{ value: 'Packaging, Printing & Document Services', label: 'Packaging, Printing & Document Services' },
	{ value: 'Pharmaceuticals & Cosmeceuticals', label: 'Pharmaceuticals & Cosmeceuticals' },
	{ value: 'Real Estate & Property Services', label: 'Real Estate & Property Services' },
	{ value: 'Renewable Energy', label: 'Renewable Energy' },
	{ value: 'Retail & Wholesale Trade', label: 'Retail & Wholesale Trade' },
	{ value: 'Textile & Garment', label: 'Textile & Garment' },
	{ value: 'Telecommunications', label: 'Telecommunications' },
	{ value: 'Transportation & Mobility', label: 'Transportation & Mobility' },
	{ value: 'Technology & Product Development', label: 'Technology & Product Development' },
	{ value: 'Marketing & Digital Services', label: 'Marketing & Digital Services' },
	{ value: 'Government & Public Sector / PSUs', label: 'Government & Public Sector / PSUs' },
	{ value: 'Non-Profit & Social Development', label: 'Non-Profit & Social Development' },
	{ value: 'Co-operative Societies & Institutions', label: 'Co-operative Societies & Institutions' },
	{ value: 'B2B Services & Business Support', label: 'B2B Services & Business Support' },
	{ value: 'Facilities Management & Technical Services', label: 'Facilities Management & Technical Services' },
	{ value: 'Research & Product Development', label: 'Research & Product Development' },
	{ value: 'Other', label: 'Other' }
];

const legacyMapping = {
	'Accounting/Finance': 'Accounting, Tax & Audit Services',
	'Construction': 'Construction & Infrastructure',
	'Education': 'Education & Training',
	'Energy': 'Oil & Gas & Energy',
	'Engineering': 'Engineering & Technical Services',
	'Financial Services': 'Banking & Financial Services',
	'Government': 'Government & Public Sector / PSUs',
	'Healthcare': 'Healthcare & Hospitals',
	'Information Technology': 'IT & Information Technology',
	'Legal': 'Law & Legal Services',
	'Logistics & Supply Chain': 'Logistics, Courier & Warehousing',
	'Manufacturing': 'Manufacturing & Industrial',
	'Professional Services': 'Consulting & Corporate Services',
	'Real Estate': 'Real Estate & Property Services',
	'Retail': 'Retail & Wholesale Trade',
	'Transportation': 'Transportation & Mobility'
};

const industryValueSet = new Set(INDUSTRY_OPTIONS.map((option) => option.value));

export function normalizeIndustryValue(value) {
	const industry = typeof value === 'string' ? value.trim() : '';
	if (!industry) return '';
	if (industryValueSet.has(industry)) return industry;
	if (legacyMapping[industry]) return legacyMapping[industry];
	return industry || 'Other';
}
