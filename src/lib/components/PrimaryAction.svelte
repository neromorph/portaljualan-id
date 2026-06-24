<script lang="ts">
	import type { Snippet } from 'svelte';
	let { href = '', type = 'link', children } = $props<{
		href?: string;
		type?: 'link' | 'button';
		children?: Snippet;
	}>();
</script>

{#if type === 'button'}
	<button class="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300">
		{#if children}{@render children()}{/if}
	</button>
{:else}
	<a class="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300" href={href}>
		{#if children}{@render children()}{/if}
	</a>
{/if}