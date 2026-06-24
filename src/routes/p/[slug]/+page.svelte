<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { profile } = $derived(data);

	const levelLabel: Record<string, string> = {
		awal: 'Awal',
		berkembang: 'Berkembang',
		siap_kolaborasi: 'Siap Kolaborasi'
	};
</script>

<svelte:head>
	<title>{profile.business_name ?? 'Profil'} | PortalJualan ID</title>
	<meta name="description" content="Profil usaha {profile.business_name} di PortalJualan ID" />
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 space-y-6">
	<div class="text-center text-sm text-muted-foreground mb-4">
		<a href="/" class="hover:underline">← PortalJualan ID</a>
	</div>

	<!-- Business Profile -->
	<section class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-slate-950">{profile.business_name ?? '-'}</h1>
				<p class="text-sm text-slate-500">{profile.business_type ?? '-'}</p>
			</div>
			<span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
				{levelLabel[profile.readiness_level ?? 'awal'] ?? 'Awal'}
			</span>
		</div>

		<div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
			{#if profile.location}
				<div><span class="text-slate-500">Lokasi</span><p class="font-medium text-slate-900">{profile.location}</p></div>
			{/if}
			{#if profile.started_year}
				<div><span class="text-slate-500">Tahun mulai</span><p class="font-medium text-slate-900">{profile.started_year}</p></div>
			{/if}
			{#if profile.products_or_services}
				<div class="col-span-2"><span class="text-slate-500">Produk / Layanan</span><p class="font-medium text-slate-900">{profile.products_or_services}</p></div>
			{/if}
		</div>

		{#if profile.sales_channels?.length}
			<div class="space-y-1">
				<span class="text-sm text-slate-500">Kanal Penjualan</span>
				<div class="flex flex-wrap gap-2">
					{#each profile.sales_channels as channel}
						<span class="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">{channel}</span>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<!-- Readiness Score -->
	{#if profile.readiness_score}
		<section class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-3">
			<div class="flex items-baseline gap-3">
				<span class="text-4xl font-bold text-emerald-800">{profile.readiness_score}</span>
				<span class="text-lg text-emerald-600">/ 100</span>
				<span class="ml-auto text-sm font-medium text-emerald-700">
					{levelLabel[profile.readiness_level ?? 'awal']}
				</span>
			</div>
			{#if profile.readiness_explanation}
				<p class="text-sm text-emerald-800 leading-relaxed">{profile.readiness_explanation}</p>
			{/if}
		</section>
	{/if}

	<!-- Business Needs & Goals -->
	{#if profile.business_needs || profile.growth_target}
		<section class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
			<h2 class="font-semibold text-slate-900">Tentang Usaha</h2>
			{#if profile.business_needs}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Kebutuhan</span>
					<p class="text-sm text-slate-900">{profile.business_needs}</p>
				</div>
			{/if}
			{#if profile.growth_target}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Target</span>
					<p class="text-sm text-slate-900">{profile.growth_target}</p>
				</div>
			{/if}
		</section>
	{/if}

	<!-- CTA -->
	<div class="text-center space-y-2 pt-2">
		<p class="text-sm text-muted-foreground">
			Tertarik bekerja sama? <a href="/" class="text-primary hover:underline">Buat profil bisnismu</a> dan temukan mitra potensial.
		</p>
	</div>
</main>
