import { GEMINI_API_BASE, GEMINI_API_KEY, GEMINI_MODEL } from '$env/static/private';

const BASE_URL = GEMINI_API_BASE.endsWith('/') ? GEMINI_API_BASE.slice(0, -1) : GEMINI_API_BASE;
const MODEL = GEMINI_MODEL || 'gemini-3.1-flash-lite';

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu UMKM Indonesia membangun profil usaha.
Kamu mengekstrak informasi usaha dari cerita yang diberikan pengguna.
Jawab hanya dengan JSON valid. Jangan tambahkan penjelasan, markdown, atau teks lain di luar JSON.
Jika informasi tidak tersedia atau tidak jelas, gunakan null untuk field tersebut.
Jangan mengarang informasi. Lebih baik null daripada salah.`;

export interface ExtractionResult {
	extracted: Partial<BusinessProfileInput>;
	raw: string;
}

interface BusinessProfileInput {
	businessName?: string;
	businessType?: string;
	location?: string;
	startedYear?: number;
	productsOrServices?: string;
	monthlyRevenueEstimate?: string;
	employeeCount?: number;
	salesChannels?: string[];
	businessNeeds?: string;
	growthTarget?: string;
	mainChallenges?: string;
	strengths?: string[];
	risks?: string[];
	evidenceSummary?: string;
}

async function chat(prompt: string, maxTokens = 300): Promise<string> {
	const res = await fetch(`${BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${GEMINI_API_KEY}`
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: prompt }
			],
			max_tokens: maxTokens
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Gemini API error ${res.status}: ${text}`);
	}

	const json = await res.json();
	const content = json?.choices?.[0]?.message?.content;
	if (!content) throw new Error('Gemini returned empty response');
	return content;
}

async function chatJson<T>(prompt: string, schema: Record<string, unknown>, maxTokens = 500): Promise<T> {
	const res = await fetch(`${BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${GEMINI_API_KEY}`
		},
		body: JSON.stringify({
			model: MODEL,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: prompt }
			],
			response_format: { type: 'json_object' },
			max_tokens: maxTokens
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Gemini API error ${res.status}: ${text}`);
	}

	const json = await res.json();
	const content = json?.choices?.[0]?.message?.content;
	if (!content) throw new Error('Gemini returned empty response');

	try {
		return JSON.parse(content) as T;
	} catch {
		throw new Error(`Invalid JSON from Gemini: ${content.slice(0, 200)}`);
	}
}

export async function extractBusinessProfile(story: string): Promise<ExtractionResult> {
	const prompt = `Ekstrak informasi usaha dari cerita berikut. Prioritaskan field yang paling penting: businessName, businessType, location, startedYear, productsOrServices, businessNeeds.

Cerita usaha:
---
${story}
---

JSON dengan field: businessName, businessType, location, startedYear (angka tahun), productsOrServices, monthlyRevenueEstimate, employeeCount (angka), salesChannels (array string), businessNeeds, growthTarget, mainChallenges, strengths (array string), risks (array string), evidenceSummary.`;

	const raw = await chat(prompt);

	let extracted: Partial<BusinessProfileInput>;
	try {
		extracted = JSON.parse(raw);
	} catch {
		throw new Error(`Invalid JSON from Gemini: ${raw.slice(0, 200)}`);
	}

	return { extracted, raw };
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

Tulis penjelasan 2-3 kalimat yang:
1. Menyebutkan skor dan level
2. Menyoroti 1-2 kekuatan utama
3. Menyarankan 1 perbaikan paling penting
Gunakan bahasa kasual yang mudah dipahami.`;

	return chat(prompt, 300);
}

export async function generateImprovementSuggestions(
	profile: BusinessProfileInput
): Promise<string[]> {
	const prompt = `Berikan 3 saran perbaikan untuk profil usaha berikut. Jawab dengan JSON array of strings.

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

	try {
		const result = await chatJson<{ suggestions?: string[] }>(prompt, { type: 'object' });
		return result.suggestions ?? [];
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

	return chat(prompt, 300);
}
