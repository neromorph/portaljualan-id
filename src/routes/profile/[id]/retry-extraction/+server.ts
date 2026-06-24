import { error, redirect } from '@sveltejs/kit';
import { canRetryExtraction } from '$lib/server/profile-lifecycle';
import { extractBusinessProfile } from '$lib/server/gemini';
import { scoreReadiness } from '$lib/server/readiness-scoring';
import { buildProfileEmbeddingText, generateEmbedding } from '$lib/server/openrouter-embeddings';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw redirect(303, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('business_profiles')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', session.user.id)
		.single();

	if (!profile) throw error(404, 'Profil tidak ditemukan.');
	if (!canRetryExtraction(profile)) throw error(400, 'Retry belum tersedia.');

	await locals.supabase
		.from('business_profiles')
		.update({
			extraction_status: 'pending',
			extraction_attempts: (profile.extraction_attempts ?? 0) + 1,
			last_extraction_attempt_at: new Date().toISOString()
		})
		.eq('id', params.id);

	let result;
	try {
		result = await extractBusinessProfile(profile.raw_story ?? '');
	} catch (e) {
		console.error('Retry extraction error:', e);
		await locals.supabase.from('business_profiles').update({
			extraction_status: 'failed',
			extraction_error: 'Ekstraksi ulang belum berhasil. Silakan lengkapi profil secara manual.'
		}).eq('id', params.id);
		throw redirect(303, `/profile/${params.id}/edit`);
	}
	const extracted = result.extracted ?? {};
	const readinessResult = scoreReadiness({
		businessName: extracted.businessName,
		businessType: extracted.businessType,
		location: extracted.location,
		startedYear: extracted.startedYear,
		productsOrServices: extracted.productsOrServices,
		monthlyRevenueEstimate: extracted.monthlyRevenueEstimate,
		employeeCount: extracted.employeeCount,
		salesChannels: extracted.salesChannels,
		businessNeeds: extracted.businessNeeds,
		growthTarget: extracted.growthTarget,
		mainChallenges: extracted.mainChallenges,
		strengths: extracted.strengths,
		risks: extracted.risks,
		evidenceSummary: extracted.evidenceSummary
	});

	const embeddingText = buildProfileEmbeddingText({
		businessName: extracted.businessName,
		businessType: extracted.businessType,
		location: extracted.location,
		businessNeeds: extracted.businessNeeds,
		growthTarget: extracted.growthTarget,
		productsOrServices: extracted.productsOrServices,
		salesChannels: extracted.salesChannels
	});

	let embedding: number[] | null = null;
	try { embedding = await generateEmbedding(embeddingText); } catch {}

	await locals.supabase.from('business_profiles').update({
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
		embedding_text: embeddingText || null,
		embedding: embedding ? `[${embedding.join(',')}]` : null,
		extraction_status: 'succeeded',
		extraction_error: null
	}).eq('id', params.id);

	throw redirect(303, `/profile/${params.id}`);
};
