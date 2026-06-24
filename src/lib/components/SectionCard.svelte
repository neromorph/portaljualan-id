<script lang="ts">
	import type { Snippet } from 'svelte';
	let { title = '', description = '', children } = $props<{
		title?: string;
		description?: string;
		children?: Snippet;
	}>();
</script>

<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
	{#if title || description}
		<div class="mb-4 space-y-1">
			{#if title}<h2 class="font-semibold text-slate-950">{title}</h2>{/if}
			{#if description}<p class="text-sm leading-6 text-slate-600">{description}</p>{/if}
		</div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</section>