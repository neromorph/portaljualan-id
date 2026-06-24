import { redirect } from '@sveltejs/kit';
import { scoreReadiness } from '$lib/server/readiness-scoring';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		redirect(303, '/auth/login');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			redirect(303, '/auth/login');
		}

		const data = await request.formData();
		const rawStory = String(data.get('rawStory') ?? '').trim();

		if (rawStory.length < 40) {
			return { rawStory, error: 'Ceritakan usaha kamu minimal 40 karakter.' };
		}

		// ponytail: Gemini extraction comes after local form path works end-to-end.
		const result = scoreReadiness({});

		return { rawStory, result };
	}
};
