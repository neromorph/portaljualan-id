import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim().toLowerCase();

		if (!email || !email.includes('@')) {
			return fail(400, { email, error: 'Masukkan alamat email yang valid.' });
		}

		const { error } = await locals.supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});

		if (error) {
			return fail(500, { email, error: 'Gagal mengirim link. Coba lagi nanti.' });
		}

		return { email, success: true };
	}
};
