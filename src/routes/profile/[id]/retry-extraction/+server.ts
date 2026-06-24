import { error, redirect } from '@sveltejs/kit';
import { canRetryExtraction } from '$lib/server/profile-lifecycle';
import { extractBusinessProfile } from '$lib/server/gemini';
import { applyExtractionResult } from '$lib/server/profile-extraction';
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
	await applyExtractionResult(locals, params.id, profile, result.extracted ?? {});

	throw redirect(303, `/profile/${params.id}`);
};
