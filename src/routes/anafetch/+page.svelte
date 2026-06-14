<script lang="ts">
	import Nav from "$lib/Nav.svelte";
	import AnaFetch from "$lib/AnaFetch.svelte";
</script>

<Nav></Nav>
<main>
	<section id="terminal-body">
		<div class="term-step">
			<AnaFetch />
		</div>
	</section>
</main>


<style>
	main {
		margin: 5rem auto 0;
		padding: 0 3rem 2rem;
		max-width: 1100px;
		box-sizing: border-box;
		font-family: 'SFMono-Terminal', 'IBM Plex Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
		font-size: 13px;
		font-weight: 400;
		line-height: 1.25;
		letter-spacing: -0.3px;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-variant-ligatures: none;
	}
	section { width: 100%; }

	#terminal-body {
		width: 100%;
		margin-top: clamp(1.5rem, 3vw, 2rem);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.term-step {
		width: fit-content;
		max-width: 100%;
	}

	@media (max-width: 768px) {
		main { margin-top: 4.5rem; padding: 0 1.25rem clamp(12rem, 26vh, 17rem); }
	}
	@media (max-width: 430px) {
		main { margin-top: 4.25rem; padding: 0 0.75rem clamp(13rem, 30vh, 19rem); }
	}
</style>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>
