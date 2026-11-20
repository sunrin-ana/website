<script lang="ts">
	import Nav from '$lib/Nav.svelte';
	import LogoDots from '$lib/LogoDots.svelte';
</script>

<svelte:head>
	<title>AnA</title>
	<meta
		name="description"
		content="새로운 도약과 함께 성장하는 Application & Architecture, 선린인터넷고등학교 소프트웨어과 AnA"
	/>
</svelte:head>

<Nav />

<main>
	<div class="mark">
		<LogoDots />
	</div>
	<p class="hero">
		새로운 도약과 함께 성장하는 <span class="ana">AnA</span><br />
		<strong>Application &amp; Architecture</strong>
	</p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100svh;
		padding: var(--nav-h) 24px 0;
		background: var(--surface);
	}
	.mark {
		width: clamp(240px, 46vmin, 420px);
		margin-bottom: clamp(8px, 2vh, 24px);
	}
	.hero {
		margin: 0;
		text-align: center;
		font-size: 1.5rem;
		line-height: 1.5;
		letter-spacing: -0.02em;
	}
	.ana {
		color: var(--brand-ink);
		font-weight: 600;
	}
	strong {
		font-weight: 600;
	}
	@media (max-width: 640px) {
		.hero {
			font-size: 1.2rem;
		}
	}
</style>
