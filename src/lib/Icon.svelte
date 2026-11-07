<script lang="ts">
	type Name = 'app' | 'arch' | 'infra' | 'globe' | 'pin' | 'spark' | 'arrow' | 'external' | 'code' | 'mail';
	let { name, size = 20 }: { name: Name; size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'app'}
		<rect x="3" y="4.5" width="18" height="15" rx="2.5" />
		<path d="M3 8.5h18" />
		<circle cx="6" cy="6.5" r=".4" fill="currentColor" />
		<circle cx="7.8" cy="6.5" r=".4" fill="currentColor" />
		<path d="M7 13h5M7 16h8" />
	{:else if name === 'arch'}
		<rect x="9" y="3" width="6" height="5" rx="1.2" />
		<rect x="3" y="16" width="6" height="5" rx="1.2" />
		<rect x="15" y="16" width="6" height="5" rx="1.2" />
		<path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
	{:else if name === 'infra'}
		<rect x="3.5" y="4" width="17" height="6" rx="1.5" />
		<rect x="3.5" y="14" width="17" height="6" rx="1.5" />
		<path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
	{:else if name === 'globe'}
		<circle cx="12" cy="12" r="8.5" />
		<path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5z" />
	{:else if name === 'pin'}
		<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
		<circle cx="12" cy="10" r="2.3" />
	{:else if name === 'spark'}
		<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
	{:else if name === 'arrow'}
		<path d="M5 12h14M13 6l6 6-6 6" />
	{:else if name === 'external'}
		<path d="M8 16 16 8M9 8h7v7" />
	{:else if name === 'code'}
		<path d="M9 7.5 4.5 12 9 16.5M15 7.5l4.5 4.5-4.5 4.5" />
	{:else if name === 'mail'}
		<rect x="3" y="5" width="18" height="14" rx="2.5" />
		<path d="m4 7 8 6 8-6" />
	{/if}
</svg>
