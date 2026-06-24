import { canApplyExtraction } from './profile-lifecycle';
import { explainReadiness, generateImprovementSuggestions } from './gemini';
import { buildProfileEmbeddingText, generateEmbedding } from './openrouter-embeddings';
import { scoreReadiness } from './readiness-scoring';

export async function applyExtractionResult(
	locals: App.Locals,
	profileId: string,
	profile: { status: 'draft' | 'reviewed' | null | undefined } | null,
	extracted: Record<string, unknown>
) {
	const readinessResult = scoreReadiness({
		businessName: extracted.businessName as string | undefined,
		businessType: extracted.businessType as string | undefined,
		location: extracted.location as string | undefined,
		startedYear: extracted.startedYear as number | undefined,
		productsOrServices: extracted.productsOrServices as string | undefined,
		monthlyRevenueEstimate: extracted.monthlyRevenueEstimate as string | undefined,
		employeeCount: extracted.employeeCount as number | undefined,
		salesChannels: extracted.salesChannels as string[] | undefined,
		businessNeeds: extracted.businessNeeds as string | undefined,
		growthTarget: extracted.growthTarget as string | undefined,
		mainChallenges: extracted.mainChallenges as string | undefined,
		strengths: extracted.strengths as string[] | undefined,
		risks: extracted.risks as string[] | undefined,
		evidenceSummary: extracted.evidenceSummary as string | undefined
	});

	const embeddingText = buildProfileEmbeddingText({
		businessName: extracted.businessName as string | undefined,
		businessType: extracted.businessType as string | undefined,
		location: extracted.location as string | undefined,
		businessNeeds: extracted.businessNeeds as string | undefined,
		growthTarget: extracted.growthTarget as string | undefined,
		productsOrServices: extracted.productsOrServices as string | undefined,
		salesChannels: extracted.salesChannels as string[] | undefined
	});

	let explanation = '';
	let suggestions: string[] = [];
	try {
		[explanation, suggestions] = await Promise.all([
			explainReadiness(extracted as Parameters<typeof explainReadiness>[0], readinessResult),
			generateImprovementSuggestions(extracted as Parameters<typeof generateImprovementSuggestions>[0])
		]);
	} catch (e) {
		console.error('Gemini explanation error:', e);
	}

	let embedding: number[] | null = null;
	try {
		embedding = await generateEmbedding(embeddingText);
	} catch (e) {
		console.error('Embedding error:', e);
	}

	return locals.supabase.from('business_profiles').update(
		canApplyExtraction(profile)
			? {
				business_name: extracted.businessName ?? null,
				business_type: extracted.businessType ?? null,
				location: extracted.location ?? null,
				started_year: extracted.startedYear ?? null,
				products_or_services: extracted.productsOrServices ?? null,
				monthly_revenue_estimate: extracted.monthlyRevenueEstimate ?? null,
				employee_count: extracted.employeeCount ?? null,
				sales_channels: extracted.salesChannels ?? null,
				business_needs: extracted.businessNeeds ?? null,
				growth_target: extracted.growthTarget ?? null,
				main_challenges: extracted.mainChallenges ?? null,
				strengths: extracted.strengths ?? null,
				risks: extracted.risks ?? null,
				evidence_summary: extracted.evidenceSummary ?? null,
				extraction_json: extracted,
				readiness_score: readinessResult.score,
				readiness_level: readinessResult.level,
				readiness_breakdown: readinessResult.breakdown,
				readiness_explanation: explanation || null,
				improvement_suggestions: suggestions,
				embedding_text: embeddingText || null,
				embedding_model: embedding ? 'openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free' : null,
				embedding: embedding ? `[${embedding.join(',')}]` : null,
				extraction_status: 'succeeded',
				extraction_error: null
			}
			: {
				extraction_status: 'succeeded',
				extraction_error: null
			}
	).eq('id', profileId);
}
