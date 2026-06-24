<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const levelLabel: Record<string, string> = {
		awal: 'Awal',
		berkembang: 'Berkembang',
		siap_kolaborasi: 'Siap Kolaborasi'
	};
</script>

<svelte:head>
	<title>Dashboard | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 space-y-6">
	<header class="flex items-center justify-between">
		<div>
			<p class="text-sm font-medium text-emerald-700">PortalJualan ID</p>
			<h1 class="text-2xl font-bold tracking-tight text-slate-950">Dashboard</h1>
			<p class="text-sm text-slate-500">{data.user.email}</p>
		</div>
		<form method="POST" action="?/logout" use:enhance>
			<button
				type="submit"
				class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				Keluar
			</button>
		</form>
	</header>

	<!-- New profile CTA -->
	<a
		class="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-5 py-4 font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
		href="/profile/new"
	>
		<span>+</span> Buat profil usaha baru
	</a>

	<!-- Profile list -->
	{#if data.profiles.length > 0}
		<section class="space-y-3">
			<h2 class="text-sm font-semibold text-slate-700">Profil Usaha</h2>
			{#each data.profiles as profile}
				<a
					href="/profile/{profile.id}"
					class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
				>
					<div class="min-w-0">
						<p class="font-semibold text-slate-900 truncate">
							{profile.business_name ?? 'Usaha Baru'}
						</p>
						<p class="text-xs text-slate-500">
							{profile.business_type ?? '-'} · {new Date(profile.created_at).toLocaleDateString('id-ID')}
						</p>
					</div>
					<div class="flex items-center gap-2 shrink-0">
						{#if profile.readiness_score != null}
							<span class="text-sm font-semibold text-slate-700">{profile.readiness_score}</span>
						{/if}
						<span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
							{levelLabel[profile.readiness_level ?? 'awal'] ?? 'Awal'}
						</span>
					</div>
				</a>
			{/each}
		</section>
	{:else}
		<section class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
			<p class="text-sm text-slate-600">Belum ada profil usaha.</p>
			<p class="text-xs text-slate-400 mt-1">Buat profil pertama kamu untuk melihat kesiapan kolaborasi.</p>
		</section>
	{/if}
</main>
