import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { generateIntroMessage } from '$lib/server/gemini';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ?? '');

export const load: PageServerLoad = async ({ params, locals }) => {
	const profileId = params.id;

	// Load profile
	const { data: profile, error: profileError } = await locals.supabase
		.from('business_profiles')
		.select('*')
		.eq('id', profileId)
		.single();

	if (profileError || !profile) {
		throw error(404, 'Profil tidak ditemukan');
	}

	// Verify ownership
	const { user } = await locals.safeGetSession();
	if (!user || profile.user_id !== user.id) {
		throw error(403, 'Tidak punya akses ke profil ini');
	}

	// Get all active partners
	const { data: partners, error: partnersError } = await supabaseAdmin
		.from('business_partners')
		.select('*')
		.eq('is_active', true);

	if (partnersError || !partners) {
		throw error(500, 'Gagal memuat daftar mitra');
	}

	// Hybrid scoring
	const scoredPartners = await Promise.all(
		partners.map(async (partner) => {
			const ruleScore = calculateRuleScore(profile, partner);
			let vectorScore = 0;
			let finalScore = ruleScore;

			// Vector similarity if both embeddings exist
			if (profile.embedding && partner.embedding) {
				vectorScore = cosineSimilarity(profile.embedding, partner.embedding);
				finalScore = ruleScore * 0.6 + vectorScore * 0.4;
			}

			return {
				...partner,
				ruleScore: Math.round(ruleScore * 100),
				vectorScore: Math.round(vectorScore * 100),
				finalScore: Math.round(finalScore * 100),
				introMessage: null
			};
		})
	);

	// Sort by final score descending
	scoredPartners.sort((a, b) => b.finalScore - a.finalScore);

	// Generate intro messages for top 3 partners only (Gemini API call per partner)
	const top3 = scoredPartners.slice(0, 3);
	const profileInput = {
		businessName: profile.business_name,
		businessType: profile.business_type,
		location: profile.location,
		productsOrServices: profile.products_or_services,
		businessNeeds: profile.business_needs,
		growthTarget: profile.growth_target
	};

	await Promise.all(
		top3.map(async (partner) => {
			try {
				partner.introMessage = await generateIntroMessage(
					profileInput,
					partner.name,
					partner.partner_type
				);
			} catch {
				partner.introMessage = null;
			}
		})
	);

	return {
		profile,
		partners: scoredPartners.slice(0, 10) // top 10
	};
};

// Simple cosine similarity for 1D arrays
function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) return 0;
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}
	if (normA === 0 || normB === 0) return 0;
	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Rule-based score 0-1 for a profile-partner pair
function calculateRuleScore(profile: Record<string, unknown>, partner: Record<string, unknown>): number {
	let score = 0;
	let weight = 0;

	const businessType = normalize(String(profile.business_type ?? ''));
	const businessNeeds = normalize(String(profile.business_needs ?? ''));
	const location = normalize(String(profile.location ?? ''));
	const salesChannels = Array.isArray(profile.sales_channels) ? profile.sales_channels : [];
	const employeeCount = Number(profile.employee_count ?? 0);
	const partnerType = String(partner.partner_type ?? '');
	const partnerCategories = Array.isArray(partner.served_business_categories)
		? partner.served_business_categories
		: [];
	const partnerNeeds = Array.isArray(partner.suitable_needs) ? partner.suitable_needs : [];
	const partnerScales = Array.isArray(partner.suitable_business_scale)
		? partner.suitable_business_scale
		: [];
	const partnerLocations = normalize(String(partner.location ?? ''));

	// 1. Business category fit: 30%
	weight += 30;
	if (partnerCategories.some((c: string) => businessType.includes(c) || c.includes(businessType))) {
		score += 30;
	} else if (partnerCategories.some((c: string) => isRelatedCategory(businessType, c))) {
		score += 15;
	}

	// 2. Need-to-partner fit: 30%
	weight += 30;
	const needKeywords = extractKeywords(businessNeeds);
	const partnerNeedKeywords = partnerNeeds.flatMap((n: string) => extractKeywords(String(n)));
	if (needKeywords.some((k: string) => partnerNeedKeywords.includes(k))) {
		score += 30;
	} else if (needKeywords.length > 0) {
		// Partial credit if at least one related keyword
		score += 10;
	}

	// 3. Location fit: 15%
	weight += 15;
	if (sameRegion(location, partnerLocations)) {
		score += 15;
	} else if (partnerLocations.includes('Online') || partnerLocations.includes('Jakarta')) {
		// Online/nasional partners always have good coverage
		score += 10;
	}

	// 4. Business scale fit: 15%
	weight += 15;
	const scale = employeeCountToScale(employeeCount);
	if (partnerScales.includes(scale) || partnerScales.includes('small')) {
		score += 15;
	} else if (scale === 'medium' && partnerScales.includes('small')) {
		score += 8;
	}

	// 5. Channel fit: 10%
	weight += 10;
	const needsDigitalChannel =
		salesChannels.length === 0 ||
		salesChannels.includes('online') ||
		salesChannels.includes('social_media') ||
		salesChannels.includes('marketplace');
	const partnerIsDigital =
		partnerType === 'digital_marketing' ||
		partnerType === 'market_access' ||
		partnerType === 'design_tool';
	if (needsDigitalChannel && partnerIsDigital) {
		score += 10;
	} else if (!needsDigitalChannel && !partnerIsDigital) {
		score += 10;
	}

	return weight > 0 ? score / weight : 0;
}

function normalize(s: string): string {
	return s.toLowerCase().trim();
}

function extractKeywords(s: string): string[] {
	return normalize(s)
		.split(/[,\s]+/)
		.filter((w) => w.length > 2)
		.filter(
			(w) =>
				![
					'dan',
					'untuk',
					'dengan',
					'yang',
					'dari',
					'ke',
					'ini',
					'itu',
					'juga',
					'lebih',
					'saya',
					'bisa',
					'butuh',
					'mau',
					'ada'
				].includes(w)
		);
}

function isRelatedCategory(profile: string, partner: string): boolean {
	const categories: Record<string, string[]> = {
		food: ['restaurant', 'catering', 'snack', 'beverage'],
		'frozen food': ['restaurant', 'catering', 'food'],
		fashion: ['handicraft', 'beauty'],
		beauty: ['fashion', 'handicraft'],
		handicraft: ['fashion', 'beauty'],
		service: ['retail']
	};
	const related = categories[profile] ?? [];
	return related.includes(partner);
}

function sameRegion(a: string, b: string): boolean {
	const cities: Record<string, string> = {
		jakarta: 'jabodetabek',
		'bekasi': 'jabodetabek',
		'depok': 'jabodetabek',
		tangerang: 'jabodetabek',
		bogor: 'jabodetabek',
		bandung: 'jabar',
		surabaya: 'jatim',
		solo: 'jateng',
		semarang: 'jateng'
	};
	return cities[a] === cities[b] || cities[b] === cities[a];
}

function employeeCountToScale(count: number): string {
	if (count <= 4) return 'micro';
	if (count <= 19) return 'small';
	if (count <= 99) return 'medium';
	return 'large';
}
