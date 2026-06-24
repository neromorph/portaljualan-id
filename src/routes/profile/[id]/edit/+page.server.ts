import { error, redirect } from '@sveltejs/kit';
import { scoreReadiness } from '$lib/server/readiness-scoring';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('business_profiles')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', session.user.id)
		.single();

	if (!profile) error(404, 'Profil tidak ditemukan.');

	return { profile };
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session) redirect(303, '/auth/login');

		const data = await request.formData();
		const updatePayload = {
			business_name: String(data.get('business_name') ?? '').trim() || null,
			business_type: String(data.get('business_type') ?? '').trim() || null,
			location: String(data.get('location') ?? '').trim() || null,
			started_year: Number(data.get('started_year') || 0) || null,
			products_or_services: String(data.get('products_or_services') ?? '').trim() || null,
			monthly_revenue_estimate: String(data.get('monthly_revenue_estimate') ?? '').trim() || null,
			employee_count: Number(data.get('employee_count') || 0) || null,
			sales_channels: data.getAll('sales_channels').map(String).filter(Boolean),
			business_needs: String(data.get('business_needs') ?? '').trim() || null,
			growth_target: String(data.get('growth_target') ?? '').trim() || null,
			main_challenges: String(data.get('main_challenges') ?? '').trim() || null
		};

		const readinessResult = scoreReadiness({
			businessName: updatePayload.business_name ?? undefined,
			businessType: updatePayload.business_type ?? undefined,
			location: updatePayload.location ?? undefined,
			startedYear: updatePayload.started_year ?? undefined,
			productsOrServices: updatePayload.products_or_services ?? undefined,
			monthlyRevenueEstimate: updatePayload.monthly_revenue_estimate ?? undefined,
			employeeCount: updatePayload.employee_count ?? undefined,
			salesChannels: updatePayload.sales_channels,
			businessNeeds: updatePayload.business_needs ?? undefined,
			growthTarget: updatePayload.growth_target ?? undefined,
			mainChallenges: updatePayload.main_challenges ?? undefined,
			strengths: undefined,
			risks: undefined,
			evidenceSummary: undefined
		});

		await locals.supabase
			.from('business_profiles')
			.update({
				...updatePayload,
				status: 'reviewed',
				readiness_score: readinessResult.score,
				readiness_level: readinessResult.level,
				readiness_breakdown: readinessResult.breakdown,
				readiness_explanation: null,
				improvement_suggestions: [],
				strengths: [],
				risks: [],
				evidence_summary: null,
				extraction_json: {}
			})
			.eq('id', params.id)
			.eq('user_id', session.user.id);

		redirect(303, `/profile/${params.id}`);
	}
};
