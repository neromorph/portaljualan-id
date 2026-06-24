import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) redirect(303, '/auth/login');

	const { data: profiles } = await locals.supabase
		.from('business_profiles')
		.select('id, business_name, business_type, readiness_score, readiness_level, is_public, created_at')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	return { session, user, profiles: profiles ?? [] };
};

export const actions: Actions = {
	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	}
};
