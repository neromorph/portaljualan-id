import {
	OPENROUTER_API_BASE,
	OPENROUTER_API_KEY,
	OPENROUTER_EMBEDDING_MODEL
} from '$env/static/private';

/**
 * Generate embedding via OpenRouter-compatible API.
 * Uses nvidia/llama-nemotron-embed-vl-1b-v2:free model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
	const url = `${OPENROUTER_API_BASE}/embeddings`;

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENROUTER_API_KEY}`
		},
		body: JSON.stringify({
			model: OPENROUTER_EMBEDDING_MODEL,
			input: text.trim()
		})
	});

	if (!res.ok) {
		const text2 = await res.text();
		throw new Error(`OpenRouter embedding failed: ${res.status} ${text2}`);
	}

	const json = await res.json();
	const embedding = json?.data?.[0]?.embedding;

	if (!embedding || !Array.isArray(embedding)) {
		throw new Error(`OpenRouter returned invalid embedding: ${JSON.stringify(json)}`);
	}

	return embedding;
}

/**
 * Build searchable text from a business profile for embedding.
 */
export function buildProfileEmbeddingText(profile: {
	businessName?: string;
	businessType?: string;
	location?: string;
	businessNeeds?: string;
	growthTarget?: string;
	productsOrServices?: string;
	salesChannels?: string[];
}): string {
	const parts: string[] = [];
	if (profile.businessName) parts.push(`Nama usaha: ${profile.businessName}`);
	if (profile.businessType) parts.push(`Jenis usaha: ${profile.businessType}`);
	if (profile.location) parts.push(`Lokasi: ${profile.location}`);
	if (profile.productsOrServices) parts.push(`Produk/layanan: ${profile.productsOrServices}`);
	if (profile.businessNeeds) parts.push(`Kebutuhan usaha: ${profile.businessNeeds}`);
	if (profile.growthTarget) parts.push(`Target pertumbuhan: ${profile.growthTarget}`);
	if (profile.salesChannels?.length) parts.push(`Kanal penjualan: ${profile.salesChannels.join(', ')}`);
	return parts.join(' | ');
}

/**
 * Build searchable text from a business partner.
 */
export function buildPartnerEmbeddingText(partner: {
	name?: string;
	partnerType?: string;
	location?: string;
	description?: string;
	suitableNeeds?: string[];
	suitableBusinessScale?: string;
	servedBusinessCategories?: string[];
}): string {
	const parts: string[] = [];
	if (partner.name) parts.push(`Nama mitra: ${partner.name}`);
	if (partner.partnerType) parts.push(`Tipe mitra: ${partner.partnerType}`);
	if (partner.location) parts.push(`Lokasi: ${partner.location}`);
	if (partner.description) parts.push(`Deskripsi: ${partner.description}`);
	if (partner.suitableNeeds?.length) parts.push(`Cocok untuk kebutuhan: ${partner.suitableNeeds.join(', ')}`);
	if (partner.suitableBusinessScale) parts.push(`Skala UMKM: ${partner.suitableBusinessScale}`);
	if (partner.servedBusinessCategories?.length) parts.push(`Melayani kategori: ${partner.servedBusinessCategories.join(', ')}`);
	return parts.join(' | ');
}
