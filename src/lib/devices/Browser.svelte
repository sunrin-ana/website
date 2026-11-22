<script lang="ts">
	// A minimal browser window: traffic lights, an address pill, then the page.
	import type { Snippet } from 'svelte';
	let { url = '', children }: { url?: string; children: Snippet } = $props();
</script>

<div class="browser">
	<div class="bar" aria-hidden="true">
		<span class="lights"><i></i><i></i><i></i></span>
		<span class="addr">{url}</span>
		<span></span>
	</div>
	<div class="screen">{@render children()}</div>
</div>

<style>
	.browser {
		width: 100%;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--surface);
		box-shadow: 0 12px 24px -16px color-mix(in srgb, var(--ink) 30%, transparent);
	}
	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: 36px;
		padding: 0 14px;
		border-bottom: 1px solid var(--line);
		background: var(--surface-3);
	}
	.lights {
		display: flex;
		gap: 6px;
	}
	.lights i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--line-2);
	}
	.addr {
		min-width: 0;
		padding: 3px 40px;
		border-radius: 6px;
		background: var(--surface-2);
		font-size: 12px;
		color: var(--ink-3);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.screen {
		position: relative;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		container-type: inline-size;
	}
	@media (max-width: 640px) {
		.bar {
			height: 28px;
		}
		.addr {
			padding: 2px 16px;
			font-size: 11px;
		}
	}
</style>
