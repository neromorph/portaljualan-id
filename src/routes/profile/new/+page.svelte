<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Buat profil usaha | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8">
	<a class="text-sm text-slate-600" href="/dashboard">← Kembali</a>

	<header class="space-y-2">
		<p class="text-sm font-medium text-emerald-700">Profil usaha</p>
		<h1 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Ceritakan usaha Anda dengan bahasa sehari-hari.</h1>
		<p class="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
			Kami akan membantu menyusun profil usaha, menilai kesiapan secara terstruktur, lalu memberi rekomendasi yang bisa ditindaklanjuti.
		</p>
	</header>

	<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
		<div class="mb-4 space-y-1">
			<h2 class="font-semibold text-slate-950">Apa yang sebaiknya ditulis?</h2>
			<p class="text-sm leading-6 text-slate-600">Tidak perlu sempurna. Ceritakan hal yang paling Anda tahu tentang usaha Anda.</p>
		</div>
		<ul class="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
			<li>• Jenis usaha dan produk utama</li>
			<li>• Lokasi dan lama usaha berjalan</li>
			<li>• Kanal penjualan saat ini</li>
			<li>• Perkiraan omzet atau skala usaha</li>
			<li>• Kebutuhan utama</li>
			<li>• Target pertumbuhan</li>
		</ul>
		<div class="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
			Contoh: Saya punya usaha frozen food sejak 2022 di Bandung. Omzet sekitar 15 juta per bulan. Saat ini jualan lewat WhatsApp dan reseller kecil. Saya ingin menambah freezer dan memperluas pengiriman, tapi masih bingung mencari mitra operasional.
		</div>
	</section>

	<form
		method="POST"
		class="space-y-4"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		<label class="block space-y-2">
			<span class="font-medium text-slate-900">Cerita usaha</span>
			<textarea
				name="rawStory"
				rows="10"
				required
				minlength="40"
				class="w-full rounded-2xl border border-slate-300 p-4 text-base shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
				placeholder="Tulis cerita usaha Anda di sini..."
			>{form?.rawStory ?? ''}</textarea>
		</label>

		{#if form?.error}
			<p class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{form.error}</p>
		{/if}

		<button
			type="submit"
			class="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
		>
			{submitting ? 'Sedang menyusun profil…' : 'Buat profil usaha'}
		</button>

		<p class="text-xs leading-5 text-slate-500">
			Cerita Anda disimpan sebagai profil usaha. Jika proses otomatis belum berhasil, Anda tetap bisa melengkapi profil secara manual.
		</p>
	</form>
</main>