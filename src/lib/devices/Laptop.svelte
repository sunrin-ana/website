<script lang="ts">
	// A laptop drawn in CSS: dark bezel, 16:10 screen, aluminium base with a thumb notch.
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="laptop">
	<div class="lid">
		<div class="screen">{@render children()}</div>
	</div>
	<div class="base" aria-hidden="true"><i></i></div>
</div>

<style>
	.laptop {
		width: 100%;
	}
	/* The lid is nearly as wide as the base (the base lip only just shows past it).
	   In dark mode the rim and outer ring turn lighter so the hardware stays legible
	   against the dark page and dark screenshots. */
	.lid {
		position: relative;
		margin: 0 3%;
		padding: 1.5% 1.5% 2.1%;
		border-radius: 22px 22px 0 0;
		background: #0c0c0e;
		box-shadow:
			inset 0 0 0 1.5px light-dark(#2c2c31, #4a4b52),
			0 0 0 1px light-dark(#0000000f, #ffffff1f),
			0 30px 60px -30px rgba(0, 0, 0, 0.35);
	}
	.screen {
		position: relative;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		/* roughly concentric with the lid corners; the panel's bottom edge is square */
		border-radius: 8px 8px 2px 2px;
		background: #000;
		container-type: inline-size;
	}
	.base {
		position: relative;
		aspect-ratio: 100 / 2.4;
		border-radius: 0 0 14px 14px / 0 0 100% 100%;
		background: linear-gradient(
			180deg,
			light-dark(#e6e7eb, #4a4b51) 0%,
			light-dark(#c9cbd1, #2f3035) 45%,
			light-dark(#9a9ca3, #1c1d21) 100%
		);
		box-shadow: 0 18px 30px -18px rgba(0, 0, 0, 0.45);
	}
	.base i {
		position: absolute;
		left: 50%;
		top: 0;
		width: 15%;
		height: 42%;
		transform: translateX(-50%);
		border-radius: 0 0 10px 10px;
		background: linear-gradient(180deg, light-dark(#b4b6bd, #222327), light-dark(#d4d6db, #34353a));
	}
	@media (max-width: 640px) {
		.lid {
			border-radius: 12px 12px 0 0;
		}
		.screen {
			border-radius: 6px 6px 1px 1px;
		}
	}
</style>
