import { redirect } from '@sveltejs/kit';
import { getProfileUiState } from '$lib/profile-ui-state';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) redirect(303, '/auth/login');

	// ponytail: type assertion — app uses untyped Supabase client
	const { data: profiles } = await locals.supabase
		.from('business_profiles')
		.select('id, business_name, business_type, location, readiness_score, readiness_level, status, extraction_status, improvement_suggestions, is_public, created_at')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	const shapedProfiles = (profiles ?? []).map((profile) => ({
		...profile,
		uiState: getProfileUiState(profile)
	}));

	return { session, user, profiles: shapedProfiles as any };
};

export const actions: Actions = {
	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/');
	}
};