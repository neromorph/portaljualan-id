<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Masuk | PortalJualan ID</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-4 py-12">
	<a class="text-sm text-slate-600 self-start" href="/">← Kembali</a>

	<section class="space-y-3">
		<p class="text-sm font-medium text-emerald-700">PortalJualan ID</p>
		<h1 class="text-3xl font-bold tracking-tight text-slate-950">Masuk ke akun kamu.</h1>
		<p class="text-slate-600">
			Kami akan kirim link masuk ke email kamu. Tanpa password, tanpa ribet.
		</p>
	</section>

	{#if form?.success}
		<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-1">
			<p class="font-semibold text-emerald-950">Link sudah terkirim!</p>
			<p class="text-sm text-emerald-800">
				Cek email <strong>{form.email}</strong> dan klik link untuk masuk.
			</p>
			<p class="text-xs text-emerald-700">Link berlaku 1 jam. Cek folder spam kalau tidak ada.</p>
		</div>
	{:else}
		<form method="POST" class="space-y-4">
			<label class="block space-y-2">
				<span class="font-medium text-slate-900">Alamat email</span>
				<input
					type="email"
					name="email"
					value={form?.email ?? ''}
					required
					autocomplete="email"
					placeholder="nama@email.com"
					class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
				/>
			</label>

			{#if form?.error}
				<p class="rounded-xl bg-red-50 p-3 text-sm text-red-700">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
			>
				Kirim link masuk
			</button>
		</form>
	{/if}
</main>
