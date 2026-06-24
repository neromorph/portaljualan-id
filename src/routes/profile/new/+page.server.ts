import { redirect, fail } from '@sveltejs/kit';
import { canApplyExtraction } from '$lib/server/profile-lifecycle';
import { extractBusinessProfile, explainReadiness, generateImprovementSuggestions } from '$lib/server/gemini';
import { generateEmbedding, buildProfileEmbeddingText } from '$lib/server/openrouter-embeddings';
import { scoreReadiness } from '$lib/server/readiness-scoring';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/auth/login');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session) redirect(303, '/auth/login');

		const data = await request.formData();
		const rawStory = String(data.get('rawStory') ?? '').trim();

		if (rawStory.length < 40) {
			return fail(400, { rawStory, error: 'Ceritakan usaha kamu minimal 40 karakter.' });
		}

		// 1. Save draft to Supabase
		const { data: profile, error: insertError } = await locals.supabase
			.from('business_profiles')
			.insert({
				user_id: session.user.id,
				raw_story: rawStory,
				status: 'draft',
				extraction_status: 'pending',
				extraction_error: null,
				extraction_attempts: 1,
				last_extraction_attempt_at: new Date().toISOString(),
				extraction_json: {},
				readiness_breakdown: {},
				improvement_suggestions: []
			})
			.select()
			.single();

		if (insertError || !profile) {
			console.error('Profile insert error:', insertError);
			return fail(500, { rawStory, error: 'Gagal menyimpan profil. Coba lagi.' });
		}

		// 2. Extract structured profile with Gemini
		let extracted: Record<string, unknown> = {};
		try {
			const result = await extractBusinessProfile(rawStory);
			extracted = result.extracted ?? {};
		} catch (e) {
			console.error('Gemini extraction error:', e);
			await locals.supabase
				.from('business_profiles')
				.update({
					extraction_status: 'failed',
					extraction_error: 'Ekstraksi profil belum berhasil. Silakan periksa dan lengkapi profil secara manual.'
				})
				.eq('id', profile.id);
			throw redirect(303, `/profile/${profile.id}/edit`);
		}

		// 3. Score readiness with extracted data
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

		// 4. Generate AI explanations
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

		// 5. Generate embedding
		let embeddingText = '';
		let embedding: number[] | null = null;
		let embeddingModel = '';
		try {
			embeddingText = buildProfileEmbeddingText({
				businessName: extracted.businessName as string | undefined,
				businessType: extracted.businessType as string | undefined,
				location: extracted.location as string | undefined,
				businessNeeds: extracted.businessNeeds as string | undefined,
				growthTarget: extracted.growthTarget as string | undefined,
				productsOrServices: extracted.productsOrServices as string | undefined,
				salesChannels: extracted.salesChannels as string[] | undefined
			});
			embedding = await generateEmbedding(embeddingText);
			embeddingModel = 'openrouter/nvidia/llama-nemotron-embed-vl-1b-v2:free';
		} catch (e) {
			console.error('Embedding error:', e);
		}

		const { data: latestProfile } = await locals.supabase
			.from('business_profiles')
			.select('status')
			.eq('id', profile.id)
			.single();

		const { error: updateError } = await locals.supabase
			.from('business_profiles')
			.update(canApplyExtraction(latestProfile) ? {
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
				embedding_model: embeddingModel || null,
				embedding: embedding ? `[${embedding.join(',')}]` : null,
				extraction_status: 'succeeded',
				extraction_error: null
			} : {
				extraction_status: 'succeeded',
				extraction_error: null
			})
			.eq('id', profile.id);

		if (updateError) {
			console.error('Profile update error:', updateError);
			return fail(500, { rawStory, error: 'Gagal menyimpan hasil ekstraksi. Coba lagi.' });
		}

		redirect(303, `/profile/${profile.id}`);
	}
};
