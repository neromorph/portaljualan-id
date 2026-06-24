<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.profile);
</script>

<svelte:head>
	<title>Periksa Profil — {p.business_name ?? 'Profil Usaha'}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 space-y-6">
	<a class="text-sm text-slate-600" href={resolve(`/profile/${p.id}`)}>← Kembali ke profil</a>
	<header class="space-y-2">
		<h1 class="text-2xl font-bold text-slate-950">Periksa & lengkapi profil</h1>
		<p class="text-sm text-slate-600">Periksa dan simpan profil ini agar informasi usaha siap digunakan dan bisa dibagikan.</p>
	</header>

	<form method="POST" use:enhance class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
		<section class="space-y-4">
			<h2 class="font-semibold text-slate-900">Identitas usaha</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="space-y-1 text-sm"><span>Nama usaha</span><input name="business_name" value={p.business_name ?? ''} class="w-full rounded-xl border px-3 py-2" /></label>
				<label class="space-y-1 text-sm"><span>Jenis usaha</span><input name="business_type" value={p.business_type ?? ''} class="w-full rounded-xl border px-3 py-2" /></label>
				<label class="space-y-1 text-sm"><span>Lokasi</span><input name="location" value={p.location ?? ''} class="w-full rounded-xl border px-3 py-2" /></label>
				<label class="space-y-1 text-sm"><span>Tahun mulai</span><input name="started_year" type="number" value={p.started_year ?? ''} class="w-full rounded-xl border px-3 py-2" /></label>
			</div>
		</section>

		<section class="space-y-4">
			<h2 class="font-semibold text-slate-900">Operasional</h2>
			<label class="space-y-1 text-sm block"><span>Produk / layanan</span><textarea name="products_or_services" rows="3" class="w-full rounded-xl border px-3 py-2">{p.products_or_services ?? ''}</textarea></label>
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="space-y-1 text-sm"><span>Omzet bulanan</span><input name="monthly_revenue_estimate" value={p.monthly_revenue_estimate ?? ''} class="w-full rounded-xl border px-3 py-2" /></label>
				<label class="space-y-1 text-sm"><span>Jumlah karyawan</span><input name="employee_count" type="number" value={p.employee_count ?? ''} class="w-full rounded-xl border px-3 py-2" /></label>
			</div>
			<div class="space-y-2 text-sm">
				<span>Kanal penjualan</span>
				<label class="flex items-center gap-2"><input type="checkbox" name="sales_channels" value="Offline" checked={p.sales_channels?.includes('Offline')} />Offline</label>
				<label class="flex items-center gap-2"><input type="checkbox" name="sales_channels" value="Online" checked={p.sales_channels?.includes('Online')} />Online</label>
				<label class="flex items-center gap-2"><input type="checkbox" name="sales_channels" value="Reseller" checked={p.sales_channels?.includes('Reseller')} />Reseller</label>
			</div>
		</section>

		<section class="space-y-4">
			<h2 class="font-semibold text-slate-900">Kebutuhan & target</h2>
			<label class="space-y-1 text-sm block"><span>Kebutuhan usaha</span><textarea name="business_needs" rows="3" class="w-full rounded-xl border px-3 py-2">{p.business_needs ?? ''}</textarea></label>
			<label class="space-y-1 text-sm block"><span>Target pertumbuhan</span><textarea name="growth_target" rows="3" class="w-full rounded-xl border px-3 py-2">{p.growth_target ?? ''}</textarea></label>
			<label class="space-y-1 text-sm block"><span>Kendala utama</span><textarea name="main_challenges" rows="3" class="w-full rounded-xl border px-3 py-2">{p.main_challenges ?? ''}</textarea></label>
		</section>

		<div class="flex gap-3">
			<button class="rounded-xl bg-emerald-700 px-4 py-2 font-medium text-white" type="submit">Simpan & tandai ditinjau</button>
			<a class="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700" href={resolve(`/profile/${p.id}`)}>Batal</a>
		</div>
	</form>
</main>
