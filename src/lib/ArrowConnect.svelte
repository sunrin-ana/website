<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	let sp: HTMLSpanElement;
	let current = 0;
	let dir = 1;
	const width = 8;
	let intervalId: ReturnType<typeof setInterval> | undefined;
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	export let delay = 0;
	export let tickMs = 100;
	export let onStep: (step: number, width: number, dir: number) => void = () => {};

	function draw() {
		if (!sp) return;
		sp.innerHTML = "&lt; ";
		for (let i = 0; i < width; i++) {
			if (i === current) sp.innerHTML += '<span style="color: limegreen;">=</span>';
			else sp.innerHTML += "=";
		}
		sp.innerHTML += " &gt;";
		onStep(current, width, dir);

		if (current > (width - 2)) dir = -1;
		else if (current < 1) dir = 1;
		current += dir;
	}

	onMount(() => {
		timeoutId = setTimeout(() => {
			draw();
			intervalId = setInterval(draw, tickMs);
		}, delay);
	});

	onDestroy(() => {
		clearTimeout(timeoutId);
		clearInterval(intervalId);
	});
</script>

<span bind:this={sp}></span>
