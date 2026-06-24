import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// ponytail: explicit type needed — Svelte template requires typed field access
type PublicProfile = {
	id: string;
	business_name: string | null;
	business_type: string | null;
	location: string | null;
	started_year: number | null;
	products_or_services: string | null;
	sales_channels: string[] | null;
	readiness_score: number | null;
	readiness_level: string | null;
	readiness_explanation: string | null;
	business_needs: string | null;
	growth_target: string | null;
	public_slug: string | null;
};

// ponytail: public profile only exposes safe fields — list is source of truth
const PUBLIC_FIELDS =
	'id, business_name, business_type, location, started_year, ' +
	'products_or_services, sales_channels, readiness_score, readiness_level, ' +
	'readiness_explanation, business_needs, growth_target, public_slug';

export const load: PageServerLoad = async ({ params, locals }): Promise<{ profile: PublicProfile }> => {
	const { slug } = params;

	const { data, error: profileError } = await locals.supabase
		.from('business_profiles')
		.select(PUBLIC_FIELDS)
		.eq('public_slug', slug)
		.eq('is_public', true)
		.single() as unknown as { data: PublicProfile | null; error: unknown };

	if (profileError || !data) {
		throw error(404, 'Profil tidak ditemukan atau belum dipublikasikan.');
	}

	return { profile: data };
};
