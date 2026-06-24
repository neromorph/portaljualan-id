import { GEMINI_API_BASE, GEMINI_API_KEY, GEMINI_MODEL } from '$env/static/private';
import type { BusinessProfileInput } from '$lib/schemas/business-profile';

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu UMKM Indonesia membangun profil usaha.
Kamu mengekstrak informasi usaha dari cerita yang diberikan pengguna.
Jawab hanya dengan JSON valid. Jangan tambahkan penjelasan, markdown, atau teks lain di luar JSON.
Jika informasi tidak tersedia atau tidak jelas, gunakan null untuk field tersebut.
Jangan mengarang informasi. Lebih baik null daripada salah.`;

const EXTRACTION_SCHEMA = {
	type: 'object',
	required: [],
	properties: {
		businessName: { type: 'string', description: 'Nama usaha' },
		businessType: { type: 'string', description: 'Jenis usaha (contoh: frozen food, laundry, fashion, catering, warung, kerajinan, jasa)' },
		location: { type: 'string', description: 'Lokasi usaha (kota/kabupaten dan provinsi)' },
		startedYear: { type: 'integer', description: 'Tahun usaha dimulai' },
		productsOrServices: { type: 'string', description: 'Produk atau layanan utama usaha' },
		monthlyRevenueEstimate: { type: 'string', description: 'Estimasi omzet bulanan dalam bahasa Indonesia' },
		employeeCount: { type: 'integer', description: 'Jumlah karyawan termasuk pemilik' },
		salesChannels: { type: 'array', items: { type: 'string' }, description: 'Kanal penjualan yang digunakan' },
		businessNeeds: { type: 'string', description: 'Kebutuhan usaha saat ini' },
		growthTarget: { type: 'string', description: 'Target pertumbuhan usaha' },
		mainChallenges: { type: 'string', description: 'Kendala atau tantangan utama usaha' },
		strengths: { type: 'array', items: { type: 'string' }, description: 'Kekuatan atau keunggulan usaha' },
		risks: { type: 'array', items: { type: 'string' }, description: 'Risiko atau kelemahan usaha' },
		evidenceSummary: { type: 'string', description: 'Ringkasan bukti aktivitas usaha yang disebutkan' }
	}
};

const EXTRACTION_PROMPT = `Ekstrak informasi usaha dari cerita berikut. Prioritaskan field yang paling penting: businessName, businessType, location, startedYear, productsOrServices, businessNeeds.

Cerita usaha:
---
{story}
---`;

export interface ExtractionResult {
	extracted: Partial<BusinessProfileInput>;
	raw: string;
}

export async function extractBusinessProfile(story: string): Promise<ExtractionResult> {
	const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

	const body = {
		contents: [
			{
				role: 'user',
				parts: [
					{ text: SYSTEM_PROMPT },
					{ text: EXTRACTION_PROMPT.replace('{story}', story) }
				]
			}
		],
		generationConfig: {
			responseMimeType: 'application/json',
			// @ts-ignore - Gemini API supports schema in generateContent
			responseSchema: EXTRACTION_SCHEMA
		}
	};

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Gemini extraction failed: ${res.status} ${text}`);
	}

	const json = await res.json();
	const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

	if (!text) {
		throw new Error('Gemini returned empty response');
	}

	let extracted: Partial<BusinessProfileInput>;
	try {
		extracted = JSON.parse(text);
	} catch {
		throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
	}

	return { extracted, raw: text };
}

export async function explainReadiness(
	profile: BusinessProfileInput,
	result: { score: number; level: string; breakdown: Record<string, number> }
): Promise<string> {
	const prompt = `Jelaskan hasil kesiapan kolaborasi berikut dalam bahasa Indonesia yang ramah untuk UMKM non-teknis.

Profil usaha:
- Nama: ${profile.businessName ?? '-'}
- Jenis: ${profile.businessType ?? '-'}
- Lokasi: ${profile.location ?? '-'}
- Products: ${profile.productsOrServices ?? '-'}
- Kebutuhan: ${profile.businessNeeds ?? '-'}
- Target: ${profile.growthTarget ?? '-'}
- Kekuatan: ${(profile.strengths ?? []).join(', ') || '-'}
- Risiko: ${(profile.risks ?? []).join(', ') || '-'}
- Omzet: ${profile.monthlyRevenueEstimate ?? '-'}
- Karyawan: ${profile.employeeCount ?? '-'}
- Kanal: ${(profile.salesChannels ?? []).join(', ') || '-'}
- Tahun mulai: ${profile.startedYear ?? '-'}
- Bukti: ${profile.evidenceSummary ?? '-'}

Hasil assessment:
- Skor: ${result.score}/100
- Level: ${result.level}
- Breakdown: ${JSON.stringify(result.breakdown)}

Tulis penjelasan 2-3 kalimat yang:
1. Menyebutkan skor dan level
2. Menyoroti 1-2 kekuatan utama
3. Menyarankan 1 perbaikan paling penting
Gunakan bahasa kasual yang mudah dipahami.`;

	const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: { maxOutputTokens: 300 }
		})
	});

	if (!res.ok) return `Skor kesiapan kolaborasi kamu: ${result.score}/100 (${result.level}).`;

	const json = await res.json();
	const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
	return text ?? `Skor kesiapan kolaborasi kamu: ${result.score}/100 (${result.level}).`;
}

export async function generateImprovementSuggestions(
	profile: BusinessProfileInput
): Promise<string[]> {
	const prompt = `Berikan 3 saran perbaikan untuk profil usaha berikut. Jawab hanya dengan JSON array of strings.

Profil usaha:
- Nama: ${profile.businessName ?? '-'}
- Jenis: ${profile.businessType ?? '-'}
- Lokasi: ${profile.location ?? '-'}
- Products: ${profile.productsOrServices ?? '-'}
- Kebutuhan: ${profile.businessNeeds ?? '-'}
- Target: ${profile.growthTarget ?? '-'}
- Kekuatan: ${(profile.strengths ?? []).join(', ') || '-'}
- Risiko: ${(profile.risks ?? []).join(', ') || '-'}
- Omzet: ${profile.monthlyRevenueEstimate ?? '-'}
- Karyawan: ${profile.employeeCount ?? '-'}
- Kanal: ${(profile.salesChannels ?? []).join(', ') || '-'}
- Tahun mulai: ${profile.startedYear ?? '-'}
- Bukti: ${profile.evidenceSummary ?? '-'}`;

	const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: {
				responseMimeType: 'application/json',
				// @ts-ignore
				responseSchema: { type: 'array', items: { type: 'string' } }
			}
		})
	});

	if (!res.ok) return [];

	const json = await res.json();
	const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) return [];

	try {
		return JSON.parse(text);
	} catch {
		return [];
	}
}

export async function generateIntroMessage(
	profile: BusinessProfileInput,
	partnerName: string,
	partnerType: string
): Promise<string> {
	const prompt = `Buat pesan perkenalan singkat (maksimal 150 kata) dari UMKM berikut untuk calon mitra.

Profil UMKM:
- Nama usaha: ${profile.businessName ?? '-'}
- Jenis usaha: ${profile.businessType ?? '-'}
- Lokasi: ${profile.location ?? '-'}
- Products: ${profile.productsOrServices ?? '-'}
- Omzet: ${profile.monthlyRevenueEstimate ?? '-'}
- Target: ${profile.growthTarget ?? '-'}
- Kebutuhan: ${profile.businessNeeds ?? '-'}

Tipe mitra: ${partnerType}
Nama/Sebutan mitra: ${partnerName}

Tulis pesan yang:
1. Memperkenalkan usaha dengan singkat dan jelas
2. Menyebutkan为什么要 bekerja sama dengan ${partnerType} ini
3. Menutup dengan ajakan diskusi
Gunakan bahasa Indonesia yang sopan dan ramah.`;

	const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: { maxOutputTokens: 300 }
		})
	});

	if (!res.ok) return `Halo ${partnerName}, saya ingin berkenalan dan berdiskusi tentang potensi kerja sama.`;
	const json = await res.json();
	const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
	return text ?? `Halo ${partnerName}, saya ingin berkenalan dan berdiskusi tentang potensi kerja sama.`;
}
