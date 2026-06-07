import { parseResumeToDraft } from '@/lib/resume-parser';
import { parseResumeToDraftWithOpenAi } from '@/lib/openai-resume-parser';
import { buildResumeSummaryText } from '@/lib/resume-summary';

export async function parseResumeDraft(resumeText) {
	const openAiResult = await parseResumeToDraftWithOpenAi(resumeText);
	if (openAiResult.ok) {
		const draft = {
			...openAiResult.draft,
			summary: buildResumeSummaryText({
				rawResumeText: resumeText,
				draft: openAiResult.draft,
				parsedSkills: openAiResult.parsedSkills || [],
				educationRecords: openAiResult.educationRecords || [],
				workExperienceRecords: openAiResult.workExperienceRecords || []
			})
		};

		return {
			draft,
			warnings: openAiResult.warnings,
			parsedSkills: openAiResult.parsedSkills || [],
			educationRecords: openAiResult.educationRecords || [],
			workExperienceRecords: openAiResult.workExperienceRecords || [],
			parser: 'openai'
		};
	}

	const fallbackResult = parseResumeToDraft(resumeText);
	const warnings = [
		...(openAiResult.warning ? [openAiResult.warning] : []),
		...(Array.isArray(fallbackResult.warnings) ? fallbackResult.warnings : [])
	];
	const draft = {
		...fallbackResult.draft,
		summary: buildResumeSummaryText({
			rawResumeText: resumeText,
			draft: fallbackResult.draft,
			parsedSkills: fallbackResult.parsedSkills || [],
			educationRecords: fallbackResult.educationRecords || [],
			workExperienceRecords: fallbackResult.workExperienceRecords || []
		})
	};

	return {
		draft,
		warnings,
		parsedSkills: fallbackResult.parsedSkills || [],
		educationRecords: fallbackResult.educationRecords || [],
		workExperienceRecords: fallbackResult.workExperienceRecords || [],
		parser: 'fallback'
	};
}
