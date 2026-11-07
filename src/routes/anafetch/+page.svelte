<script lang="ts">
	import Nav from '$lib/Nav.svelte';
	import AnaFetch from '$lib/AnaFetch.svelte';
</script>

<svelte:head>
	<title>anafetch — AnA</title>
</svelte:head>

<Nav />

<main>
	<div class="window">
		<div class="w-bar">
			<span class="lights"><i></i><i></i><i></i></span>
			<span>sunrin@ana: ~</span>
			<span class="r">zsh</span>
		</div>
		<div class="w-body">
			<AnaFetch />
		</div>
	</div>
</main>

<style>
	main {
		min-height: 100svh;
		padding: calc(var(--nav-h) + 48px) 24px 48px;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		background-color: var(--surface-3);
		background-image: radial-gradient(var(--line-strong) 1px, transparent 1px);
		background-size: 16px 16px;
	}
	.window {
		width: min(980px, 100%);
		border: 1px solid var(--line);
		border-radius: 14px;
		background: #fff;
		overflow: hidden;
		box-shadow: 0 40px 80px -48px rgba(20, 30, 80, 0.35);
	}
	.w-bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: 40px;
		padding: 0 14px;
		border-bottom: 1px solid var(--line);
		background: var(--surface-3);
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--ink-3);
	}
	.lights {
		display: flex;
		gap: 7px;
	}
	.lights i {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: #e2e2e7;
	}
	.r {
		justify-self: end;
	}
	.w-body {
		padding: 24px 28px 32px;
		font-size: 13px;
		line-height: 1.3;
		overflow-x: auto;
	}
	@media (max-width: 640px) {
		main {
			padding: calc(var(--nav-h) + 24px) 12px 24px;
		}
		.w-body {
			padding: 16px;
			font-size: 10px;
		}
	}
</style>
