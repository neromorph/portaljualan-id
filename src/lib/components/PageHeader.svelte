<script lang="ts">
	let { eyebrow = '', title, description = '' } = $props<{
		eyebrow?: string;
		title: string;
		description?: string;
	}>();
</script>

<header class="space-y-2">
	{#if eyebrow}
		<p class="text-sm font-medium text-emerald-700">{eyebrow}</p>
	{/if}
	<h1 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
	{#if description}
		<p class="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
	{/if}
</header>