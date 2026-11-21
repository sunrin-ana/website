<script lang="ts">
	// What a device shows: a screenshot (with an optional dark-mode variant that follows the
	// resolved theme — toggle or OS) or, when there is none yet, a splash in the project's colours.
	import { onMount } from 'svelte';
	import { getTheme, onThemeChange } from '$lib/theme.js';

	let {
		src,
		srcDark,
		alt = '',
		name,
		theme,
		mark = false,
		eager = false
	}: {
		src?: string;
		srcDark?: string;
		alt?: string;
		name: string;
		theme: [string, string];
		mark?: boolean;
		eager?: boolean;
	} = $props();

	// null on the server: fall back to the OS media query until we know the resolved theme.
	let resolved = $state<'light' | 'dark' | null>(null);
	onMount(() => onThemeChange(() => (resolved = getTheme())));
	const darkMedia = $derived(
		resolved === 'dark' ? 'all' : resolved === 'light' ? 'not all' : '(prefers-color-scheme: dark)'
	);

	const LOGO =
		'M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z';
</script>

{#if src}
	<picture class="shot">
		{#if srcDark}<source srcset={srcDark} media={darkMedia} />{/if}
		<img {src} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
	</picture>
{:else}
	<!-- decorative placeholder: the page heading already names the project -->
	<div class="splash" style="--from:{theme[0]}; --to:{theme[1]}" aria-hidden="true">
		<span class="glyph">
			{#if mark}
				<svg viewBox="0 0 52 52"><path fill-rule="evenodd" clip-rule="evenodd" d={LOGO} fill="currentColor" /></svg>
			{:else}
				{name.slice(0, 1)}
			{/if}
		</span>
	</div>
{/if}

<style>
	.shot,
	.shot img,
	.splash {
		display: block;
		width: 100%;
		height: 100%;
	}
	.shot img {
		object-fit: cover;
		object-position: top center;
	}
	/* sized purely in container units, so the mark keeps the same proportion on any screen */
	.splash {
		display: grid;
		place-items: center;
		background: linear-gradient(160deg, var(--from), var(--to));
		color: #fff;
	}
	.glyph {
		display: grid;
		place-items: center;
		width: 11cqi;
		aspect-ratio: 1;
		font-size: 8cqi;
		font-weight: 500;
		line-height: 1;
	}
	.glyph svg {
		width: 100%;
	}
</style>
