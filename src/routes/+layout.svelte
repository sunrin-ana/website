<script>
	import '$lib/styles/global.css';
	import { page } from '$app/state';
	import { canonicalUrl } from '$lib/seo.js';

	let { children } = $props();

	const canonical = $derived(canonicalUrl(page.url));
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
	<meta property="og:url" content={canonical} />
	<meta property="twitter:url" content={canonical} />
</svelte:head>

{@render children()}
