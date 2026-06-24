import { redirect, fail } from '@sveltejs/kit';
import { extractBusinessProfile } from '$lib/server/gemini';
import { applyExtractionResult } from '$lib/server/profile-extraction';
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

		const { data: latestProfile } = await locals.supabase
			.from('business_profiles')
			.select('status')
			.eq('id', profile.id)
			.single();

		const { error: updateError } = await applyExtractionResult(locals, profile.id, latestProfile, extracted);

		if (updateError) {
			console.error('Profile update error:', updateError);
			return fail(500, { rawStory, error: 'Gagal menyimpan hasil ekstraksi. Coba lagi.' });
		}

		redirect(303, `/profile/${profile.id}`);
	}
};
