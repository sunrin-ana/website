<script lang="ts">
	import Nav from "$lib/Nav.svelte";
	import { onDestroy, tick } from "svelte";
	import { onNavigate, afterNavigate } from "$app/navigation";
	import { waapi, utils } from "animejs";
	import ArrowConnect from "$lib/ArrowConnect.svelte";
	import Globe from "$lib/Globe.svelte";
	import AnaFetch from "$lib/AnaFetch.svelte";
	import Specs from "$lib/Specs.svelte";
	import Terminal from "$lib/Terminal.svelte";

	let showContent = false;
	let allowReveal = true;
	let activeInterval: ReturnType<typeof setInterval> | undefined;
	let activeTimeouts: ReturnType<typeof setTimeout>[] = [];

	let globeComponent: Globe;
	let terminalComponent: Terminal;

	let uptimeString = "";
	function getPreciseUptime() {
		const base = new Date('2011-03-01T00:00:00+09:00');
		const now = new Date();
		let years = now.getFullYear() - base.getFullYear();
		let months = now.getMonth() - base.getMonth();
		let days = now.getDate() - base.getDate();
		let hours = now.getHours() - base.getHours();
		let minutes = now.getMinutes() - base.getMinutes();
		if (minutes < 0) { minutes += 60; hours--; }
		if (hours < 0) { hours += 24; days--; }
		if (days < 0) { const p = new Date(now.getFullYear(), now.getMonth(), 0); days += p.getDate(); months--; }
		if (months < 0) { months += 12; years--; }
		return `${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} mins`;
	}

	function sleep(ms: number): Promise<void> {
		return new Promise(resolve => {
			const t = setTimeout(resolve, ms);
			activeTimeouts.push(t);
		});
	}

	function typeCommand(el: HTMLElement, cmd: string, speed = 58): Promise<void> {
		el.textContent = '';
		return new Promise(resolve => {
			let i = 0;
			activeInterval = setInterval(() => {
				if (!allowReveal) { clearInterval(activeInterval); resolve(); return; }
				el.textContent += cmd[i++];
				if (i >= cmd.length) { clearInterval(activeInterval); resolve(); }
			}, speed);
		});
	}

	function show(el: HTMLElement | null, withTransition = false) {
		if (!el) return;
		if (withTransition) el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
		el.style.opacity = '1';
		el.style.transform = 'translateY(0)';
	}

	function qs<T extends HTMLElement>(sel: string): T | null {
		return document.querySelector<T>(sel);
	}

	async function runSequence() {
		if (!allowReveal) return;

		const bootEl = qs('.boot-prompt');
		const bootTyped = qs<HTMLElement>('.boot-typed');
		const bootCur = qs<HTMLElement>('.boot-cur');
		show(bootEl);
		if (bootTyped) await typeCommand(bootTyped, 'boot --connect-world');
		if (!allowReveal) return;
		await sleep(200);

		globeComponent?.startSpin();
		const worldEl = qs<HTMLElement>('#world');
		if (worldEl) worldEl.style.opacity = '1';
		const pres = Array.from(document.querySelectorAll<HTMLElement>('#world pre'));
		for (const pre of pres) {
			if (!allowReveal) return;
			pre.style.opacity = '1';
			pre.style.animation = 'globe-tick 0.18s ease-out';
			await sleep(36);
		}

		if (!allowReveal) return;
		if (bootCur) bootCur.style.opacity = '0';
		await sleep(250);

		const lines = [
			{ pre: '.lp1', arrow: '.la1', suf: '.ls1', p: '○ Connecting   |   AnA ', s: ' Sunrin Internet High School' },
			{ pre: '.lp2', arrow: '.la2', suf: '.ls2', p: '○ Connecting   |   AnA ', s: ' World' },
		];
		for (const ln of lines) {
			if (!allowReveal) return;
			const preEl = qs<HTMLElement>(ln.pre);
			const arrowEl = qs<HTMLElement>(ln.arrow);
			const sufEl = qs<HTMLElement>(ln.suf);
			if (preEl) preEl.textContent = ln.p;
			if (arrowEl) arrowEl.style.opacity = '1';
			if (sufEl) sufEl.textContent = ln.s;
		}
		await sleep(400);
		if (!allowReveal) return;

		const steps = Array.from(document.querySelectorAll<HTMLElement>('.term-step:not(#term-scroll)'));
		for (const step of steps) {
			if (!allowReveal) return;
			const promptEl = step.querySelector<HTMLElement>('.type-prompt');
			const typedEl = step.querySelector<HTMLElement>('.prompt-typed');
			const curEl = step.querySelector<HTMLElement>('.prompt-cur');
			const contentEl = step.querySelector<HTMLElement>('.term-content');
			const cmd = promptEl?.dataset.cmd ?? '';

			show(promptEl);
			if (typedEl && cmd) await typeCommand(typedEl, cmd);
			if (!allowReveal) return;
			if (curEl && cmd) curEl.style.opacity = '0';

			if (contentEl && contentEl.childElementCount > 0) {
				show(contentEl, true);
				await sleep(500);
			}
		}

		const termEl = qs<HTMLElement>('#term-scroll');
		if (termEl) {
			termEl.style.transition = 'opacity 0.4s ease';
			termEl.style.opacity = '1';
		}
		await sleep(400);
		terminalComponent?.focus();
	}

	async function revealContent() {
		if (!allowReveal) return;
		showContent = true;
		await tick();
		runSequence();
	}

	afterNavigate(async () => {
		allowReveal = true;
		showContent = false;
		uptimeString = getPreciseUptime();
		clearInterval(activeInterval);
		activeTimeouts.forEach(clearTimeout);
		activeTimeouts = [];

		await tick();

		waapi.animate("#intro-title", {
			opacity: { from: 0, to: 1, duration: 620 },
			scale: { from: 0.56, to: 1.06, duration: 680 }
		});
		waapi.animate("#intro-title", {
			opacity: { from: 1, to: 0, duration: 560, delay: 1080 },
			scale: { from: 1.06, to: 1.34, duration: 560, delay: 1080 },
			onComplete: () => revealContent()
		});
	});

	onNavigate(() => {
		allowReveal = false;
		clearInterval(activeInterval);
		activeTimeouts.forEach(clearTimeout);
		globeComponent?.stopSpin();
		utils.remove("#intro-title");
		utils.remove("#link");
	});

	onDestroy(() => {
		allowReveal = false;
		clearInterval(activeInterval);
		activeTimeouts.forEach(clearTimeout);
		globeComponent?.stopSpin();
	});
</script>

<Nav></Nav>
<main>
	{#if !showContent}
		<div id="intro-overlay">
			<h1 id="intro-title">We're connecting the world</h1>
		</div>
	{/if}

	<section>
		{#if showContent}
			<div id="world-stage">
				<div class="boot-prompt" style="opacity:0">
					<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="boot-typed"></span><span class="boot-cur blink">_</span>
				</div>

				<Globe bind:this={globeComponent} />

				<div id="link" style="opacity:1">
					<div class="link-line">
						<span class="lp1"></span><span class="la1" style="opacity:0"><ArrowConnect/></span><span class="ls1"></span>
					</div>
					<div class="link-line">
						<span class="lp2"></span><span class="la2" style="opacity:0"><ArrowConnect delay={600}/></span><span class="ls2"></span>
					</div>
				</div>

				<div id="terminal-body">
					<div class="term-step">
						<div class="type-prompt" data-cmd="anafetch" style="opacity:0">
							<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="prompt-typed"></span><span class="prompt-cur blink">_</span>
						</div>
						<div class="term-content" style="opacity:0;transform:translateY(8px)">
							<AnaFetch {uptimeString} hidePrompt={true} />
						</div>
					</div>

					<div class="term-step">
						<div class="type-prompt" data-cmd="cat specs.log" style="opacity:0">
							<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="prompt-typed"></span><span class="prompt-cur blink">_</span>
						</div>
						<div class="term-content" style="opacity:0;transform:translateY(8px)">
							<Specs />
						</div>
					</div>

					<Terminal bind:this={terminalComponent} />
				</div>
			</div>
		{/if}
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

	#intro-overlay {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: #f9f9f9; z-index: 80; pointer-events: none;
	}
	#intro-title {
		margin: 0;
		font-size: clamp(2.5rem, 9vw, 6.4rem);
		font-weight: 800;
		letter-spacing: 0.08em;
		text-align: center;
		opacity: 0;
		transform: scale(0.56);
	}

	@keyframes globe-tick {
		0%   { filter: brightness(4) blur(0.4px); }
		20%  { filter: brightness(1.8); }
		55%  { filter: brightness(0.85); }
		100% { filter: brightness(1); }
	}

	.p-user  { color: #2e7d32; font-weight: 800; letter-spacing: -1px;}
	.p-sep   { color: #555; letter-spacing: -1px;}
	.p-path  { color: #1565c0; font-weight: 700; }
	.p-dollar { color: #333; }
	.blink { animation: blink 1s step-end infinite; }
	@keyframes blink { 50% { opacity: 0; } }

	#world-stage {
		width: 100%;
		display: flex; flex-flow: column;
		align-items: center;
	}

	.boot-prompt {
		width: 100%;
		font-size: clamp(0.75rem, 1.8vw, 1rem);
		margin-bottom: 1rem;
		color: #333;
	}

	#link {
		margin: 1.2rem 0 0;
		font-size: clamp(0.7rem, 1.8vw, 0.95rem);
		line-height: 1.8;
		color: #444;
		text-align: left;
		font-weight: 800;
	}
	.link-line {
		display: block;
		white-space: pre;
	}

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

	.type-prompt {
		font-size: clamp(0.75rem, 1.8vw, 1rem);
		color: #555;
		margin-bottom: 0.75rem;
	}

	@media (max-width: 768px) {
		main { margin-top: 4.5rem; padding: 0 1.25rem clamp(12rem, 26vh, 17rem); }
		#intro-title { font-size: clamp(2rem, 11vw, 3.2rem); letter-spacing: 0.04em; }
		.link-line { white-space: pre-wrap; word-break: break-all; }
	}
	@media (max-width: 430px) {
		main { margin-top: 4.25rem; padding: 0 0.75rem clamp(13rem, 30vh, 19rem); }
		#link { font-size: 0.55rem; line-height: 1.3; }
	}
</style>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>
