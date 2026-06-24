<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { profile, partners } = $derived(data);

	let expandedId = $state<string | null>(null);

	const partnerTypeLabels: Record<string, string> = {
		distributor: 'Distributor',
		packaging_supplier: 'Supplier Kemasan',
		digital_marketing: 'Digital Marketing',
		logistic: 'Logistik',
		ingredient_supplier: 'Supplier Bahan',
		equipment_rental: 'Sewa Peralatan',
		shared_kitchen: 'Dapur Bersama',
		hr_staffing: 'Rekrutmen',
		market_access: 'Akses Pasar',
		financial_admin: 'Admin & Akuntansi',
		pos_system: 'Sistem Kasir (POS)',
		packaging_design: 'Desain Kemasan',
		design_tool: 'Tools Desain'
	};

	const scoreTone = (score: number) => {
		if (score >= 75) return { text: 'text-green-600', bar: 'bg-green-500' };
		if (score >= 50) return { text: 'text-yellow-600', bar: 'bg-yellow-500' };
		return { text: 'text-red-500', bar: 'bg-red-400' };
	};
</script>

<svelte:head>
	<title>Mitra Potensial — {profile.business_name ?? 'Profil'}</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-6">
	<!-- Header -->
	<div class="mb-6">
		<a href="/profile/{profile.id}" class="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1">
			← Kembali ke Profil
		</a>
		<h1 class="text-2xl font-bold">Mitra Potensial</h1>
		<p class="text-muted-foreground text-sm mt-1">
			Rekomendasi mitra untuk <strong>{profile.business_name ?? 'bisnismu'}</strong>
		</p>
	</div>

	{#if partners.length === 0}
		<div class="text-center py-12 text-muted-foreground">
			<p>Belum ada mitra yang cocok. Coba isi profil lebih lengkap dulu.</p>
			<a href="/profile/{profile.id}" class="mt-4 inline-block text-primary hover:underline">
				Edit Profil
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each partners as partner (partner.id)}
				<div class="border rounded-lg p-4 bg-card">
					<!-- Partner header -->
					<div class="flex items-start justify-between gap-3 mb-3">
						<div>
							<h3 class="font-semibold text-base">{partner.name}</h3>
							<div class="flex items-center gap-2 mt-1">
								<span class="text-xs px-2 py-0.5 bg-muted rounded-full">
									{partnerTypeLabels[partner.partner_type] ?? partner.partner_type}
								</span>
								<span class="text-xs text-muted-foreground">📍 {partner.location}</span>
							</div>
						</div>
						<!-- Final score -->
						<div class="text-right flex-shrink-0">
							<div class="text-2xl font-bold {scoreTone(partner.finalScore).text}">
								{partner.finalScore}
							</div>
							<div class="text-xs text-muted-foreground">dari 100</div>
						</div>
					</div>

					<!-- Score bar -->
					<div class="h-2 bg-muted rounded-full overflow-hidden mb-3">
						<div
							class="h-full {scoreTone(partner.finalScore).bar} transition-all"
							style="width: {partner.finalScore}%"
						></div>
					</div>

					<!-- Score breakdown -->
					<div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
						<div>
							<span class="font-medium text-foreground">Skor Aturan:</span> {partner.ruleScore}%
						</div>
						<div>
							<span class="font-medium text-foreground">Skor Vektor:</span> {partner.vectorScore}%
						</div>
					</div>

					<!-- Description -->
					<p class="text-sm text-muted-foreground mb-3 line-clamp-2">
						{partner.description}
					</p>

					<!-- CTA -->
					<div class="flex flex-col gap-2">
						{#if partner.introMessage && expandedId !== partner.id}
							<button
								onclick={() => (expandedId = expandedId === partner.id ? null : partner.id)}
								class="text-sm text-left font-medium text-primary hover:underline"
							>
								📝 Lihat Pesan Perkenalan
							</button>
						{/if}

						{#if expandedId === partner.id && partner.introMessage}
							<div class="rounded-lg bg-muted p-3 text-sm italic text-muted-foreground leading-relaxed">
								"{partner.introMessage}"
							</div>
						{/if}

						<a
							href={partner.contact_url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
						>
							{partner.contact_label} →
						</a>
					</div>
				</div>
			{/each}
		</div>

		<p class="text-center text-xs text-muted-foreground mt-6">
			{partners.length} mitra ditampilkan. Skor dihitung dari kecocokan kategori, kebutuhan,
			lokasi, skala usaha, dan kesamaan vektor embedding.
		</p>
	{/if}
</div>
