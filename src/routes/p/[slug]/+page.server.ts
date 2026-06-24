import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { slug } = params;

	const { data: profile, error: profileError } = await locals.supabase
		.from('business_profiles')
		.select('*')
		.eq('public_slug', slug)
		.eq('is_public', true)
		.single();

	if (profileError || !profile) {
		throw error(404, 'Profil tidak ditemukan atau belum dipublikasikan.');
	}

	return { profile };
};
