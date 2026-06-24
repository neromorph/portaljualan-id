<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Dashboard | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8">
	<header class="flex items-center justify-between">
		<div>
			<p class="text-sm font-medium text-emerald-700">PortalJualan ID</p>
			<h1 class="text-2xl font-bold tracking-tight text-slate-950">Dashboard</h1>
			<p class="text-sm text-slate-500">{data.user.email}</p>
		</div>
		<div class="flex items-center gap-3">
			<a
				class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
				href="/profile/new"
			>
				Buat profil baru
			</a>
			<form method="POST" action="?/logout" use:enhance>
				<button
					type="submit"
					class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					Keluar
				</button>
			</form>
		</div>
	</header>

	<section class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
		<h2 class="mb-2 font-semibold text-slate-900">Selamat datang!</h2>
		<p class="text-sm text-slate-600">
			Buat profil usaha untuk melihat kesiapan kolaborasi dan menemukan mitra yang cocok.
		</p>
	</section>
</main>
