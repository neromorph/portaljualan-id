import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { uploadEvidence, deleteEvidence, getPublicUrl } from '$lib/server/storage';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ?? '');

export const load: PageServerLoad = async ({ params, locals }) => {
	const profileId = params.id;

	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(303, '/auth/login');

	const { data: profile, error: profileError } = await locals.supabase
		.from('business_profiles')
		.select('*')
		.eq('id', profileId)
		.eq('user_id', user.id)
		.single();

	if (profileError || !profile) throw error(404, 'Profil tidak ditemukan');

	const { data: evidence } = await locals.supabase
		.from('business_evidence')
		.select('*')
		.eq('profile_id', profileId)
		.order('created_at', { ascending: false });

	const evidenceWithUrls = (evidence ?? []).map((ev) => ({
		...ev,
		publicUrl: getPublicUrl(ev.storage_path)
	}));

	return { profile, evidence: evidenceWithUrls };
};

export const actions: Actions = {
	upload: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw redirect(303, '/auth/login');

		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file || file.size === 0) {
			return { success: false, error: 'Pilih file foto dulu.' };
		}

		try {
			const { path } = await uploadEvidence(file, params.id);

			await supabaseAdmin.from('business_evidence').insert({
				profile_id: params.id,
				storage_path: path,
				caption: formData.get('caption')?.toString() ?? ''
			});

			return { success: true };
		} catch (e) {
			return {
				success: false,
				error: e instanceof Error ? e.message : 'Upload gagal.'
			};
		}
	},

	delete: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw redirect(303, '/auth/login');

		const formData = await request.formData();
		const evidenceId = formData.get('evidenceId') as string;

		const { data: ev } = await supabaseAdmin
			.from('business_evidence')
			.select('storage_path')
			.eq('id', evidenceId)
			.eq('profile_id', params.id)
			.single();

		if (ev) {
			await deleteEvidence(ev.storage_path);
			await supabaseAdmin.from('business_evidence').delete().eq('id', evidenceId);
		}

		return { success: true };
	},

	togglePublic: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) throw redirect(303, '/auth/login');

		const formData = await request.formData();
		const makePublic = formData.get('makePublic') === 'true';

		const { data: profile } = await supabaseAdmin
			.from('business_profiles')
			.select('public_slug, status')
			.eq('id', params.id)
			.single();

		if (makePublic && profile?.status !== 'reviewed') {
			return {
				success: false,
				error: 'Periksa dan simpan profil terlebih dahulu sebelum dibagikan ke publik.'
			};
		}

		let slug = profile?.public_slug ?? null;
		if (makePublic && !slug) {
			slug = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
		}

		await supabaseAdmin
			.from('business_profiles')
			.update({ is_public: makePublic, public_slug: slug ?? undefined })
			.eq('id', params.id);

		return { success: true, isPublic: makePublic, slug };
	}
};
