<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();
	const focusedRoute = $derived(
		page.url.pathname === '/profile/new' || page.url.pathname.startsWith('/auth')
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if focusedRoute}
	{@render children()}
{:else}
	<div class="min-h-dvh bg-slate-50">
		<header class="border-b border-slate-200 bg-white">
			<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
				<a href="/dashboard" class="font-semibold text-slate-950">PortalJualan ID</a>
				<nav class="flex items-center gap-4 text-sm">
					<a class="text-slate-600 hover:text-slate-950" href="/dashboard">Dashboard</a>
					<a class="font-medium text-emerald-700 hover:text-emerald-800" href="/profile/new">Buat Profil</a>
				</nav>
			</div>
		</header>
		{@render children()}
	</div>
{/if}