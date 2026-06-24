/**
 * Generate embeddings for all seeded business partners.
 * Run: npx tsx scripts/generate-partner-embeddings.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
function loadEnv() {
	try {
		const envPath = join(__dirname, '..', '.env');
		const content = readFileSync(envPath, 'utf8');
		for (const line of content.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eqIdx = trimmed.indexOf('=');
			if (eqIdx === -1) continue;
			const key = trimmed.slice(0, eqIdx).trim();
			const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
			if (!process.env[key]) process.env[key] = val;
		}
	} catch {
		// ignore
	}
}
loadEnv();

const supabase = createClient(
	process.env.PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPENROUTER_API_BASE = process.env.OPENROUTER_API_BASE!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_EMBEDDING_MODEL = process.env.OPENROUTER_EMBEDDING_MODEL!;

async function generateEmbedding(text: string): Promise<number[]> {
	const res = await fetch(`${OPENROUTER_API_BASE}/embeddings`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENROUTER_API_KEY}`
		},
		body: JSON.stringify({ model: OPENROUTER_EMBEDDING_MODEL, input: text.trim() })
	});
	if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
	const json = await res.json();
	return json.data[0].embedding;
}

function buildPartnerText(p: Record<string, unknown>): string {
	const parts: string[] = [];
	if (p.name) parts.push(`Nama mitra: ${p.name}`);
	if (p.partner_type) parts.push(`Tipe mitra: ${p.partner_type}`);
	if (p.location) parts.push(`Lokasi: ${p.location}`);
	if (p.description) parts.push(`Deskripsi: ${p.description}`);
	if (Array.isArray(p.suitable_needs)) parts.push(`Cocok untuk kebutuhan: ${(p.suitable_needs as string[]).join(', ')}`);
	if (Array.isArray(p.served_business_categories)) parts.push(`Melayani kategori: ${(p.served_business_categories as string[]).join(', ')}`);
	return parts.join(' | ');
}

async function main() {
	const { data: partners, error } = await supabase
		.from('business_partners')
		.select('id, name, partner_type, location, description, suitable_needs, served_business_categories')
		.eq('is_active', true);

	if (error || !partners) {
		console.error('Failed to fetch partners:', error);
		process.exit(1);
	}

	console.log(`Generating embeddings for ${partners.length} partners...`);

	for (const partner of partners) {
		const text = buildPartnerText(partner as unknown as Record<string, unknown>);
		process.stdout.write(`Embedding "${partner.name}"... `);

		try {
			const embedding = await generateEmbedding(text);

			const { error: updateError } = await supabase
				.from('business_partners')
				.update({
					embedding,
					embedding_model: OPENROUTER_EMBEDDING_MODEL,
					embedding_text: text
				})
				.eq('id', partner.id);

			if (updateError) {
				console.error(`FAILED: ${updateError.message}`);
			} else {
				console.log(`✅ (${embedding.length}d)`);
			}
		} catch (err) {
			console.error(`FAILED: ${err}`);
		}

		// Rate limit guard
		await new Promise((r) => setTimeout(r, 500));
	}

	console.log('\nDone!');
}

main();
