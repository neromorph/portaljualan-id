<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Buat profil usaha | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8">
	<a class="text-sm text-slate-600" href="/">← Kembali</a>

	<section class="space-y-3">
		<p class="text-sm font-medium text-emerald-700">Profil usaha</p>
		<h1 class="text-3xl font-bold tracking-tight text-slate-950">
			Ceritakan usaha kamu seperti chat biasa.
		</h1>
		<p class="text-slate-600">
			Tulis nama usaha, jualan apa, lokasi, lama usaha, omzet kira-kira, kebutuhan, target, dan
			kendala.
		</p>
	</section>

	<form method="POST" class="space-y-4">
		<label class="block space-y-2">
			<span class="font-medium text-slate-900">Cerita usaha</span>
			<textarea
				name="rawStory"
				rows="10"
				required
				minlength="40"
				class="w-full rounded-2xl border border-slate-300 p-4 text-base shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
				placeholder="Contoh: Saya punya usaha frozen food sejak 2022 di Bandung. Omzet sekitar 15 juta per bulan. Saya ingin menambah freezer dan kendaraan pengiriman..."
			>{form?.rawStory ?? ''}</textarea>
		</label>

		{#if form?.error}
			<p class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{form.error}</p>
		{/if}

		<button
			class="w-full rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
		>
			Buat profil awal
		</button>
	</form>

	{#if form?.result}
		<section class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
			<h2 class="font-semibold text-emerald-950">Readiness sementara</h2>
			<p class="text-emerald-900">
				Skor: {form.result.score} — {form.result.level}
			</p>
			<pre class="mt-2 text-xs text-emerald-800">{JSON.stringify(form.result.breakdown, null, 2)}</pre>
		</section>
	{/if}
</main>
