<script lang="ts">
	let { title, description = '', href = '', actionLabel = '' } = $props<{
		title: string;
		description?: string;
		href?: string;
		actionLabel?: string;
	}>();
</script>

<section class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
	<h2 class="font-semibold text-slate-950">{title}</h2>
	{#if description}<p class="mt-2 text-sm leading-6 text-slate-600">{description}</p>{/if}
	{#if href && actionLabel}
		<a class="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" href={href}>
			{actionLabel}
		</a>
	{/if}
</section>