<script lang="ts">
	import SectionCard from '$lib/components/SectionCard.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import PrimaryAction from '$lib/components/PrimaryAction.svelte';

	let { data } = $props();
	const p = $derived(data.profile);
	const r = $derived(data.readinessResult);
	const ui = $derived(data.uiState);
	const lifecycle = $derived(data.lifecycle);

	const levelLabel: Record<string, string> = {
		awal: 'Awal',
		berkembang: 'Berkembang',
		siap_kolaborasi: 'Siap Kolaborasi'
	};
</script>

<svelte:head>
	<title>{p.business_name ?? 'Profil Usaha'} | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 space-y-6">
	<header class="flex items-center justify-between">
		<a class="text-sm text-slate-600 hover:text-slate-950" href="/dashboard">← Dashboard</a>
		<span class="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
	</header>

	<!-- First viewport: identity + readiness + CTA -->
	<section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div class="min-w-0">
				<h1 class="text-2xl font-bold text-slate-950">{p.business_name ?? 'Usaha Baru'}</h1>
				<p class="mt-1 text-sm text-slate-500">
					{p.business_type ?? 'Jenis usaha belum lengkap'}{p.location ? ` · ${p.location}` : ''}
				</p>
			</div>
			<StatusBadge label={ui.label} tone={ui.tone} />
		</div>

		{#if p.readiness_score != null}
			<div class="flex items-baseline gap-2">
				<span class="text-4xl font-bold text-slate-950">{r.score}</span>
				<span class="text-lg text-slate-500">/ 100</span>
				<span class="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
					{levelLabel[r.level] ?? 'Awal'}
				</span>
			</div>
		{/if}

		{#if ui.primaryActionHref}
			<PrimaryAction href={ui.primaryActionHref}>
				{ui.primaryActionLabel}
			</PrimaryAction>
		{/if}
	</section>

	<!-- Processing state -->
	{#if ui.status === 'processing'}
		<SectionCard title="Profil sedang diproses" description="Kami sedang menyusun profil usaha dari cerita yang Anda kirim.">
			<p class="text-sm text-slate-600">Halaman ini bisa dibuka kembali dari dashboard.</p>
		</SectionCard>
	{/if}

	<!-- Extraction failed state -->
	{#if lifecycle.extractionFailed}
		<SectionCard title="Beberapa bagian perlu diperiksa" description="Profil tetap tersimpan. Anda bisa melengkapi informasi secara manual.">
			{#if lifecycle.canRetryExtraction}
				<form method="POST" action="/profile/{p.id}/retry-extraction">
					<button class="mt-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white" type="submit">
						Coba ekstraksi ulang
					</button>
				</form>
			{:else if lifecycle.retryAt}
				<p class="mt-2 text-sm text-slate-600">Coba lagi setelah {new Date(lifecycle.retryAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.</p>
			{:else}
				<a class="mt-2 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white" href="/profile/{p.id}/edit">
					Lengkapi secara manual
				</a>
			{/if}
		</SectionCard>
	{/if}

	<!-- Draft state nudge -->
	{#if ui.status === 'draft'}
		<SectionCard description="Periksa dan simpan profil ini agar informasi yang dibagikan lebih akurat.">
			<a class="inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white" href="/profile/{p.id}/edit">
				Periksa & lengkapi profil
			</a>
		</SectionCard>
	{/if}

	<!-- Score breakdown (show only when scored) -->
	{#if r}
		<SectionCard title="Rincian skor kesiapan" description="Skor dihitung dari kelengkapan dan kejelasan informasi profil.">
			<div class="divide-y divide-slate-100">
				{#each [
					{ label: 'Kelengkapan profil', value: r.breakdown.profileCompleteness, max: 25 },
					{ label: 'Kejelasan kebutuhan', value: r.breakdown.needClarity, max: 20 },
					{ label: 'Kejelasan target', value: r.breakdown.targetClarity, max: 15 },
					{ label: 'Bukti aktivitas', value: r.breakdown.activityEvidence, max: 20 },
					{ label: 'Kesiapan kolaborasi', value: r.breakdown.collaborationReadiness, max: 20 }
				] as item (item.label)}
					<div class="flex items-center justify-between py-3 text-sm">
						<span class="text-slate-700">{item.label}</span>
						<span class="font-semibold text-slate-950">{item.value}/{item.max}</span>
					</div>
				{/each}
			</div>
		</SectionCard>
	{/if}

	<!-- Recommendations -->
	<section id="rekomendasi">
		<SectionCard title="Rekomendasi" description="Langkah berikut yang bisa membantu memperjelas kesiapan usaha.">
			{#if p.improvement_suggestions?.length}
				<div class="space-y-3">
					{#each p.improvement_suggestions as suggestion (suggestion)}
						<article class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
							<p>{suggestion}</p>
						</article>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-slate-600">Belum ada rekomendasi otomatis. Periksa profil untuk memastikan data usaha sudah lengkap.</p>
			{/if}
		</SectionCard>
	</section>

	<!-- Grouped profile facts -->
	{#if p.business_name || p.business_type || p.location || p.started_year || p.employee_count || p.monthly_revenue_estimate || p.products_or_services || (p.sales_channels?.length)}
		<SectionCard title="Identitas usaha">
			<dl class="space-y-3 text-sm">
				{#if p.business_type}
					<div class="flex justify-between"><dt class="text-slate-500">Jenis usaha</dt><dd class="font-medium text-slate-950 text-right">{p.business_type}</dd></div>
				{/if}
				{#if p.location}
					<div class="flex justify-between"><dt class="text-slate-500">Lokasi</dt><dd class="font-medium text-slate-950 text-right">{p.location}</dd></div>
				{/if}
				{#if p.started_year}
					<div class="flex justify-between"><dt class="text-slate-500">Tahun mulai</dt><dd class="font-medium text-slate-950 text-right">{p.started_year}</dd></div>
				{/if}
				{#if p.employee_count}
					<div class="flex justify-between"><dt class="text-slate-500">Karyawan</dt><dd class="font-medium text-slate-950 text-right">{p.employee_count} orang</dd></div>
				{/if}
				{#if p.monthly_revenue_estimate}
					<div class="flex justify-between"><dt class="text-slate-500">Omzet bulanan</dt><dd class="font-medium text-slate-950 text-right">{p.monthly_revenue_estimate}</dd></div>
				{/if}
				{#if p.products_or_services}
					<div class="flex justify-between"><dt class="text-slate-500">Produk/layanan</dt><dd class="font-medium text-slate-950 text-right max-w-[60%] text-right">{p.products_or_services}</dd></div>
				{/if}
				{#if p.sales_channels?.length}
					<div class="flex flex-wrap justify-end gap-2">
						{#each p.sales_channels as channel (channel)}
							<span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{channel}</span>
						{/each}
					</div>
				{/if}
			</dl>
		</SectionCard>
	{/if}

	{#if p.business_needs || p.growth_target || p.main_challenges}
		<SectionCard title="Kebutuhan & target">
			<dl class="space-y-3 text-sm">
				{#if p.business_needs}
					<div class="flex justify-between"><dt class="text-slate-500">Kebutuhan</dt><dd class="font-medium text-slate-950 text-right max-w-[60%]">{p.business_needs}</dd></div>
				{/if}
				{#if p.growth_target}
					<div class="flex justify-between"><dt class="text-slate-500">Target</dt><dd class="font-medium text-slate-950 text-right max-w-[60%]">{p.growth_target}</dd></div>
				{/if}
				{#if p.main_challenges}
					<div class="flex justify-between"><dt class="text-slate-500">Kendala</dt><dd class="font-medium text-slate-950 text-right max-w-[60%]">{p.main_challenges}</dd></div>
				{/if}
			</dl>
		</SectionCard>
	{/if}

	{#if p.strengths?.length || p.risks?.length || p.evidence_summary}
		<SectionCard title="Kekuatan & risiko">
			<div class="space-y-3 text-sm">
				{#if p.strengths?.length}
					<ul class="space-y-1">
						{#each p.strengths as strength (strength)}
							<li class="flex items-center gap-2 text-slate-900">
								<span class="text-emerald-500 shrink-0">✓</span>{strength}
							</li>
						{/each}
					</ul>
				{/if}
				{#if p.risks?.length}
					<ul class="space-y-1">
						{#each p.risks as risk (risk)}
							<li class="flex items-center gap-2 text-slate-700">
								<span class="text-amber-500 shrink-0">!</span>{risk}
							</li>
						{/each}
					</ul>
				{/if}
				{#if p.evidence_summary}
					<div>
						<span class="text-slate-500">Bukti aktivitas</span>
						<p class="mt-1 text-slate-900">{p.evidence_summary}</p>
					</div>
				{/if}
			</div>
		</SectionCard>
	{/if}

	<!-- Secondary actions (de-emphasized for phase 2) -->
	{#if lifecycle.isReviewed}
		<section class="flex flex-col gap-3">
			<a href="/profile/{p.id}/matches" class="w-full rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
				Cari mitra cocok
			</a>
			<a href="/profile/{p.id}/evidence" class="w-full rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
				Foto bukti & bagikan profil
			</a>
		</section>
	{/if}
</main>