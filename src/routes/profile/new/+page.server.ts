import { fail } from '@sveltejs/kit';
import { scoreReadiness } from '$lib/server/readiness-scoring';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const rawStory = String(data.get('rawStory') ?? '').trim();

		if (rawStory.length < 40) {
			return fail(400, { rawStory, error: 'Ceritakan usaha kamu minimal 40 karakter.' });
		}

		// ponytail: AI extraction — Gemini — comes after local form path works end-to-end.
		// For now show placeholder readiness from the empty score to prove the flow.
		const result = scoreReadiness({});

		return { rawStory, result };
	}
};
