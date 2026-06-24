<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/StatusBadge.svelte';

	let { data } = $props();
	let statusFilter = $state('all');
	const filteredProfiles = $derived(
		statusFilter === 'all'
			? data.profiles
			: data.profiles.filter((p: any) => p.uiState.status === statusFilter)
	);
</script>

<svelte:head>
	<title>Dashboard | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 space-y-6">
	<div class="flex items-start justify-between gap-4">
		<div class="space-y-2">
			<p class="text-sm font-medium text-emerald-700">PortalJualan ID</p>
			<h1 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Dashboard</h1>
			<p class="text-sm leading-6 text-slate-600">Pantau profil usaha, lihat status kesiapan, dan lanjutkan langkah berikutnya.</p>
		</div>
		<form method="POST" action="?/logout" use:enhance class="shrink-0">
			<button
				type="submit"
				class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				Keluar
			</button>
		</form>
	</div>

	{#if data.profiles.length === 0}
		<section class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
			<h2 class="font-semibold text-slate-950">Belum ada profil usaha</h2>
			<p class="mt-2 text-sm leading-6 text-slate-600">Buat profil pertama untuk menyusun informasi usaha dan melihat kesiapan kolaborasi.</p>
			<a class="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" href="/profile/new">
				Buat profil usaha
			</a>
		</section>
	{:else}
		<a
			class="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-5 py-4 font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
			href="/profile/new"
		>
			<span>+</span> Buat profil usaha baru
		</a>

		<label class="flex items-center gap-2 text-sm font-medium text-slate-700">
			Filter status
			<select
				bind:value={statusFilter}
				class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm sm:w-auto"
			>
				<option value="all">Semua</option>
				<option value="processing">Sedang diproses</option>
				<option value="draft">Draft</option>
				<option value="needs_attention">Perlu perhatian</option>
				<option value="ready">Siap ditinjau</option>
			</select>
		</label>

		<section class="space-y-3">
			{#each filteredProfiles as profile (profile.id)}
				<article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<h2 class="truncate font-semibold text-slate-950">
								{profile.business_name ?? 'Usaha Baru'}
							</h2>
							<p class="mt-1 text-sm text-slate-500">
								{profile.business_type ?? 'Jenis usaha belum lengkap'}{profile.location ? ` · ${profile.location}` : ''}
							</p>
						</div>
						<StatusBadge label={profile.uiState.label} tone={profile.uiState.tone} />
					</div>

					<div class="mt-4 flex items-center justify-between gap-4 text-sm">
						<p class="text-slate-600">{profile.uiState.helperText}</p>
						{#if profile.readiness_score != null}
							<p class="shrink-0 font-semibold text-slate-950">{profile.readiness_score}/100</p>
						{/if}
					</div>

					{#if profile.uiState.primaryActionHref}
						<a
							class="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
							href={profile.uiState.primaryActionHref}
						>
							{profile.uiState.primaryActionLabel}
						</a>
					{/if}
				</article>
			{/each}

			{#if filteredProfiles.length === 0}
				<p class="py-4 text-center text-sm text-slate-500">Tidak ada profil dengan filter tersebut.</p>
			{/if}
		</section>
	{/if}
</main>