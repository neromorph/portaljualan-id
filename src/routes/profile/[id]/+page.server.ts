import { redirect, error } from '@sveltejs/kit';
import { scoreReadiness } from '$lib/server/readiness-scoring';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('business_profiles')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', session.user.id)
		.single();

	if (!profile) {
		error(404, 'Profil tidak ditemukan.');
	}

	// Re-score in case fields changed
	const readinessResult = scoreReadiness({
		businessName: profile.business_name ?? undefined,
		businessType: profile.business_type ?? undefined,
		location: profile.location ?? undefined,
		startedYear: profile.started_year ?? undefined,
		productsOrServices: profile.products_or_services ?? undefined,
		monthlyRevenueEstimate: profile.monthly_revenue_estimate ?? undefined,
		employeeCount: profile.employee_count ?? undefined,
		salesChannels: profile.sales_channels ?? undefined,
		businessNeeds: profile.business_needs ?? undefined,
		growthTarget: profile.growth_target ?? undefined,
		mainChallenges: profile.main_challenges ?? undefined,
		strengths: profile.strengths ?? undefined,
		risks: profile.risks ?? undefined,
		evidenceSummary: profile.evidence_summary ?? undefined
	});

	return {
		profile,
		readinessResult
	};
};
