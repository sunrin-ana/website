<script lang="ts">
	// A phone drawn in CSS: rounded bezel, 390×844 screen, a pill-shaped camera cut-out.
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="phone">
	<div class="screen">
		{@render children()}
		<span class="island" aria-hidden="true"></span>
	</div>
</div>

<style>
	.phone {
		width: 100%;
		padding: 3.6%;
		border-radius: 16% / 7.4%;
		background: #0c0c0e;
		/* lighter titanium rim + outer ring in dark mode so the phone separates from the
		   page and from the laptop screen it overlaps */
		box-shadow:
			inset 0 0 0 2px light-dark(#34343a, #55565e),
			inset 0 0 0 3px light-dark(transparent, #1c1c20),
			0 0 0 1px light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.14)),
			0 40px 70px -30px rgba(0, 0, 0, 0.45);
	}
	.screen {
		position: relative;
		aspect-ratio: 390 / 844;
		overflow: hidden;
		border-radius: 12.5% / 5.8%;
		background: #000;
		container-type: inline-size;
	}
	.island {
		position: absolute;
		top: 1.6%;
		left: 50%;
		width: 31%;
		height: 3.6%;
		transform: translateX(-50%);
		border-radius: 999px;
		background: #000;
	}
</style>
