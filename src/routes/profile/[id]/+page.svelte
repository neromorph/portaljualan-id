<script lang="ts">
	import { resolve } from '$app/paths';
	let { data } = $props();

	const p = $derived(data.profile);
	const r = $derived(data.readinessResult);
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
		<a class="text-sm text-slate-600" href={resolve('/dashboard')}>← Dashboard</a>
		<span class="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
	</header>

	{#if lifecycle.isDraft}
		<div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
			<p class="font-semibold">Profil masih draft</p>
			<p class="mt-1 text-amber-800">Periksa dan simpan profil ini terlebih dahulu agar informasi yang dibagikan lebih akurat.</p>
			<a href={resolve(`/profile/${p.id}/edit`)} class="mt-3 inline-flex rounded-xl bg-amber-600 px-4 py-2 font-medium text-white">Periksa & lengkapi profil</a>
		</div>
	{/if}

	{#if lifecycle.extractionFailed}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
			<p class="font-semibold">Ekstraksi profil belum berhasil</p>
			<p class="mt-1">{lifecycle.extractionError}</p>
			{#if lifecycle.canRetryExtraction}
				<form class="mt-3" method="POST" action={resolve(`/profile/${p.id}/retry-extraction`)}>
					<button class="rounded-xl bg-red-700 px-4 py-2 font-medium text-white" type="submit">Coba ekstraksi ulang</button>
				</form>
			{:else if lifecycle.retryAt}
				<p class="mt-2">Coba lagi setelah {new Date(lifecycle.retryAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.</p>
			{:else}
				<p class="mt-2">Silakan lengkapi profil secara manual.</p>
			{/if}
		</div>
	{/if}

	<!-- Business Profile -->
	<section class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-slate-950">{p.business_name ?? 'Usaha Baru'}</h1>
				<p class="text-sm text-slate-500">{p.business_type ?? '-'}</p>
			</div>
			<span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
				{levelLabel[p.readiness_level ?? 'awal'] ?? 'Awal'}
			</span>
		</div>

		<div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
			{#if p.location}
				<div><span class="text-slate-500">Lokasi</span><p class="font-medium text-slate-900">{p.location}</p></div>
			{/if}
			{#if p.started_year}
				<div><span class="text-slate-500">Tahun mulai</span><p class="font-medium text-slate-900">{p.started_year}</p></div>
			{/if}
			{#if p.employee_count}
				<div><span class="text-slate-500">Karyawan</span><p class="font-medium text-slate-900">{p.employee_count} orang</p></div>
			{/if}
			{#if p.monthly_revenue_estimate}
				<div><span class="text-slate-500">Omzet bulanan</span><p class="font-medium text-slate-900">{p.monthly_revenue_estimate}</p></div>
			{/if}
		</div>

		{#if p.products_or_services}
			<div class="space-y-1">
				<span class="text-sm text-slate-500">Produk / Layanan</span>
				<p class="text-sm text-slate-900">{p.products_or_services}</p>
			</div>
		{/if}

		{#if p.sales_channels?.length}
			<div class="space-y-1">
				<span class="text-sm text-slate-500">Kanal Penjualan</span>
				<div class="flex flex-wrap gap-2">
					{#each p.sales_channels as channel (channel)}
						<span class="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">{channel}</span>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<!-- Readiness Score -->
	<section class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
		<div class="flex items-baseline gap-3">
			<span class="text-5xl font-bold text-emerald-800">{r.score}</span>
			<span class="text-lg text-emerald-600">/ 100</span>
			<span class="ml-auto text-sm font-medium text-emerald-700">{levelLabel[r.level]}</span>
		</div>

		<p class="text-sm text-emerald-800 leading-relaxed">{p.readiness_explanation ?? 'Skor kesiapan kolaborasi kamu.'}</p>

		<!-- Breakdown -->
		<div class="space-y-2">
			{#each [
				{ label: 'Kelengkapan Profil', value: r.breakdown.profileCompleteness, max: 25 },
				{ label: 'Kejelasan Kebutuhan', value: r.breakdown.needClarity, max: 20 },
				{ label: 'Kejelasan Target', value: r.breakdown.targetClarity, max: 15 },
				{ label: 'Bukti Aktivitas', value: r.breakdown.activityEvidence, max: 20 },
				{ label: 'Kesiapan Kolaborasi', value: r.breakdown.collaborationReadiness, max: 20 }
			] as item, i (item.label)}
				<div class="flex items-center gap-3 text-sm">
					<span class="w-36 text-slate-600">{item.label}</span>
					<div class="flex-1 bg-emerald-100 rounded-full h-2">
						<div
							class="h-2 rounded-full transition-all"
							style="width: {(item.value / item.max) * 100}%; background-color: rgb(16 185 129)"
						></div>
					</div>
					<span class="w-8 text-right font-medium text-slate-700">{item.value}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Strengths / Risks -->
	{#if p.business_needs || p.growth_target || p.main_challenges || p.strengths?.length || p.risks?.length || p.evidence_summary}
		<section class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
			<h2 class="font-semibold text-slate-900">Profil Usaha</h2>

			{#if p.business_needs}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Kebutuhan</span>
					<p class="text-sm text-slate-900">{p.business_needs}</p>
				</div>
			{/if}

			{#if p.growth_target}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Target</span>
					<p class="text-sm text-slate-900">{p.growth_target}</p>
				</div>
			{/if}

			{#if p.main_challenges}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Kendala</span>
					<p class="text-sm text-slate-900">{p.main_challenges}</p>
				</div>
			{/if}

			{#if p.strengths?.length}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Kekuatan</span>
					<ul class="space-y-1">
						{#each p.strengths as strength (strength)}
							<li class="flex items-center gap-2 text-sm text-slate-900">
								<span class="text-emerald-500">✓</span>{strength}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if p.risks?.length}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Risiko / Perhatian</span>
					<ul class="space-y-1">
						{#each p.risks as risk (risk)}
							<li class="flex items-center gap-2 text-sm text-slate-700">
								<span class="text-amber-500">!</span>{risk}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if p.evidence_summary}
				<div class="space-y-1">
					<span class="text-sm text-slate-500">Bukti Aktivitas</span>
					<p class="text-sm text-slate-900">{p.evidence_summary}</p>
				</div>
			{/if}
		</section>
	{/if}

	{#if lifecycle.isReviewed}
		<section class="flex flex-col gap-3">
			<a href={resolve(`/profile/${p.id}/edit`)} class="w-full rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">Periksa & lengkapi profil</a>
		</section>
	{/if}

	<!-- Suggestions -->
	{#if data.profile.improvement_suggestions?.length}
		<section class="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-2">
			<h2 class="font-semibold text-amber-900">Saran Perbaikan</h2>
			<ul class="space-y-2">
				{#each data.profile.improvement_suggestions as suggestion (suggestion)}
					<li class="flex items-start gap-2 text-sm text-amber-800">
						<span class="mt-0.5 shrink-0 text-amber-500">💡</span>{suggestion}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Actions -->
	<section class="flex flex-col gap-3">
		<a
			class="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-center font-semibold text-white shadow-sm hover:bg-emerald-800"
			href={resolve(`/profile/${p.id}/matches`)}
		>
			Cari Mitra Cocok
		</a>
		<a
			href={resolve(`/profile/${p.id}/evidence`)}
			class="w-full rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
		>
			📷 Foto Bukti & Bagikan Profil
		</a>
	</section>
</main>
