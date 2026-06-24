<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const MAX_SIZE = 5 * 1024 * 1024;

	let uploading = $state(false);
	let preview = $state<string | null>(null);
	let selectedFile = $state<File | null>(null);

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (file.size > MAX_SIZE) {
			alert('Ukuran file maksimal 5MB');
			return;
		}

		selectedFile = file;
		preview = URL.createObjectURL(file);
	}

	async function handleSubmit() {
		uploading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			uploading = false;
			selectedFile = null;
			preview = null;
		};
	}
</script>

<svelte:head>
	<title>Foto Bukti — {data.profile.business_name}</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
	<div>
		<a href={resolve(`/profile/${data.profile.id}`)} class="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
			← Kembali ke Profil
		</a>
		<h1 class="text-2xl font-bold">Foto Bukti</h1>
		<p class="text-sm text-muted-foreground mt-1">
			Tambahkan foto produk, tempat usaha, atau aktivitas bisnis sebagai bukti.
		</p>
	</div>

	<!-- Upload form -->
	<form
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		class="space-y-4"
	>
		<div class="border-2 border-dashed rounded-xl p-6 text-center">
			{#if preview}
				<img src={preview} alt="Preview" class="mx-auto max-h-48 rounded-lg mb-3 object-cover" />
			{:else}
				<div class="text-4xl mb-2">📷</div>
				<p class="text-sm text-muted-foreground mb-3">
					Pilih foto (JPG, PNG, WebP — maks 5MB)
				</p>
			{/if}

			<input
				type="file"
				name="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={handleFileSelect}
				class="hidden"
				id="file-input"
			/>

			<div class="flex gap-2 justify-center">
				{#if !preview}
					<label for="file-input" class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
						Pilih Foto
					</label>
				{:else}
					<label for="file-input" class="cursor-pointer inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
						Ganti
					</label>
					<button
						type="submit"
						disabled={uploading}
						class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{uploading ? 'Mengupload...' : 'Upload'}
					</button>
				{/if}
			</div>

			{#if selectedFile}
				<p class="text-xs text-muted-foreground mt-2">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
			{/if}
		</div>

		<input
			type="text"
			name="caption"
			placeholder="Caption opsional (contoh: 'Dapur produksi kami')"
			class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
		/>

		{#if form?.error}
			<p class="text-sm text-red-500">{form.error}</p>
		{/if}
	</form>

	<!-- Evidence grid -->
	{#if data.evidence.length > 0}
		<div class="space-y-3">
			<h2 class="font-semibold text-sm">{data.evidence.length} Foto</h2>
			<div class="grid grid-cols-2 gap-3">
				{#each data.evidence as ev (ev.id)}
					<div class="relative group">
						<img
							src={ev.publicUrl}
							alt={ev.caption ?? 'Bukti'}
							class="w-full aspect-square object-cover rounded-lg"
						/>
						{#if ev.caption}
							<p class="text-xs mt-1 text-muted-foreground">{ev.caption}</p>
						{/if}
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => async ({ update }) => { await update(); }}
							class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<input type="hidden" name="evidenceId" value={ev.id} />
							<button
								type="submit"
								class="bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-red-500"
							>
								Hapus
							</button>
						</form>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground text-center py-8">
			Belum ada foto. Upload foto pertamamu di atas.
		</p>
	{/if}

	<!-- Public sharing -->
	<div class="border rounded-xl p-4 space-y-3">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h3 class="font-semibold text-sm">Bagikan Profil</h3>
				<p class="text-xs text-muted-foreground">
					{#if data.profile.status !== 'reviewed'}
						Bagikan profil ke publik tersedia setelah profil ditinjau dan disimpan.
					{:else if data.profile.is_public}
						Profil bisa dilihat publik via link.
					{:else}
						Aktifkan untuk dapat link profil publik.
					{/if}
				</p>
			</div>
			<form
				method="POST"
				action="?/togglePublic"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<input type="hidden" name="makePublic" value={String(!data.profile.is_public)} />
				<button
					type="submit"
					disabled={data.profile.status !== 'reviewed'}
					aria-label={data.profile.is_public ? 'Nonaktifkan profil publik' : 'Aktifkan profil publik'}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {data.profile.is_public ? 'bg-primary' : 'bg-muted'} disabled:cursor-not-allowed disabled:opacity-50"
				>
					<span
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {data.profile.is_public ? 'translate-x-6' : 'translate-x-1'}"
						aria-hidden="true"
					></span>
				</button>
			</form>
		</div>


		{#if data.profile.is_public && data.profile.public_slug}
			<div class="flex gap-2">
				<input
					type="text"
					readonly
					value={resolve(`/p/${data.profile.public_slug}`)}
					class="flex-1 text-xs bg-muted px-3 py-2 rounded-lg"
					id="share-url"
				/>
				<button
					type="button"
					onclick={() => navigator.clipboard.writeText((document.getElementById('share-url') as HTMLInputElement).value)}
					class="text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90"
				>
					Salin
				</button>
			</div>
		{/if}
	</div>
</div>
