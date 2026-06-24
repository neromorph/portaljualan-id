<script lang="ts">
	type Tone = 'neutral' | 'warning' | 'success' | 'danger' | 'brand';
	let { label, tone = 'neutral' } = $props<{ label: string; tone?: Tone }>();

	const classes: Record<string, string> = {
		neutral: 'bg-slate-100 text-slate-700',
		warning: 'bg-amber-100 text-amber-800',
		success: 'bg-emerald-100 text-emerald-800',
		danger: 'bg-red-100 text-red-800',
		brand: 'bg-emerald-100 text-emerald-800'
	};
</script>

<span class={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes[tone]}`}>{label}</span>