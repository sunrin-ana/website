<script lang="ts">
	import Nav from "$lib/Nav.svelte";
	import { onDestroy, onMount, tick } from "svelte";
	import { onNavigate } from "$app/navigation";
	import { waapi, stagger, createTimeline, utils } from "animejs";
	import ArrowConnect from "$lib/ArrowConnect.svelte";
	import earthLandMask from "$lib/earth-land-mask.json";

	const WORLD_COLS = 74;
	const WORLD_ROWS = 36;
	const WORLD_RADIUS = 16.8;
	const X_ASPECT = 0.54;
	const RAD_TO_DEG = 180 / Math.PI;

	const LAND_MASK_WIDTH = earthLandMask.width;
	const LAND_MASK_HEIGHT = earthLandMask.height;

	function decodeMaskBits(base64: string) {
		const raw = atob(base64);
		const bytes = new Uint8Array(raw.length);
		for (let i = 0; i < raw.length; i++) {
			bytes[i] = raw.charCodeAt(i);
		}
		return bytes;
	}

	const LAND_MASK_BITS = decodeMaskBits(earthLandMask.data);

	let showContent = false;
	let allowReveal = true;
	let worldPhase = 0.33 + Math.PI;
	let worldRows: string[] = buildWorldRows(worldPhase);
	let worldSpinInterval: ReturnType<typeof setInterval> | undefined;
	let descriptionProgressHandler: (() => void) | undefined;
	let descriptionLines: HTMLElement[] = [];
	let nextDescriptionLine = 0;
	let unlockDescriptionReveal: (() => void) | undefined;

	function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	function normalizeLonDeg(lonDeg: number) {
		let wrapped = (lonDeg + 180) % 360;
		if (wrapped < 0) wrapped += 360;
		return wrapped - 180;
	}

	function pickRamp(chars: string, value: number) {
		const normalized = clamp(value, 0, 0.9999);
		return chars[Math.floor(normalized * chars.length)];
	}

	function smoothstep(edge0: number, edge1: number, x: number) {
		const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
		return t * t * (3 - (2 * t));
	}

	function wrapDeltaDeg(a: number, b: number) {
		let delta = Math.abs(a - b) % 360;
		if (delta > 180) delta = 360 - delta;
		return delta;
	}

	function readLandBit(x: number, y: number) {
		const wrappedX = ((x % LAND_MASK_WIDTH) + LAND_MASK_WIDTH) % LAND_MASK_WIDTH;
		const clampedY = clamp(y, 0, LAND_MASK_HEIGHT - 1);
		const bitIndex = (clampedY * LAND_MASK_WIDTH) + wrappedX;
		return (LAND_MASK_BITS[bitIndex >> 3] >> (bitIndex & 7)) & 1;
	}

	function sampleLandMask(lonDeg: number, latDeg: number) {
		const lon = normalizeLonDeg(lonDeg);
		const u = ((lon + 180) / 360) * (LAND_MASK_WIDTH - 1);
		const v = ((90 - latDeg) / 180) * (LAND_MASK_HEIGHT - 1);

		const x0 = Math.floor(u);
		const y0 = Math.floor(v);
		const x1 = (x0 + 1) % LAND_MASK_WIDTH;
		const y1 = Math.min(LAND_MASK_HEIGHT - 1, y0 + 1);
		const tx = u - x0;
		const ty = v - y0;

		const a = readLandBit(x0, y0);
		const b = readLandBit(x1, y0);
		const c = readLandBit(x0, y1);
		const d = readLandBit(x1, y1);

		const top = a + ((b - a) * tx);
		const bottom = c + ((d - c) * tx);
		return top + ((bottom - top) * ty);
	}

	function sampleLand(lon: number, lat: number) {
		const lonDeg = lon * RAD_TO_DEG;
		const latDeg = lat * RAD_TO_DEG;
		return sampleLandMask(lonDeg, latDeg);
	}

	function sampleRelief(lon: number, lat: number) {
		return (
			Math.sin((lon * 2.8) + (lat * 1.4)) * 0.22 +
			Math.cos((lon * 4.9) - (lat * 3.1)) * 0.14 +
			Math.sin((lon - lat) * 6.2) * 0.09
		);
	}

	function gaussian2D(
		lonDeg: number,
		latDeg: number,
		centerLonDeg: number,
		centerLatDeg: number,
		lonSigmaDeg: number,
		latSigmaDeg: number
	) {
		const dLon = wrapDeltaDeg(lonDeg, centerLonDeg) / lonSigmaDeg;
		const dLat = (latDeg - centerLatDeg) / latSigmaDeg;
		return Math.exp(-((dLon * dLon) + (dLat * dLat)));
	}

	function sampleDesert(lon: number, lat: number) {
		const lonDeg = lon * RAD_TO_DEG;
		const latDeg = lat * RAD_TO_DEG;
		let value = 0;

		value += gaussian2D(lonDeg, latDeg, 15, 23, 30, 14) * 0.9; // Sahara west/center
		value += gaussian2D(lonDeg, latDeg, 28, 18, 16, 10) * 0.6; // Sahara east
		value += gaussian2D(lonDeg, latDeg, 45, 24, 20, 10) * 0.6; // Arabian desert
		value += gaussian2D(lonDeg, latDeg, 100, 42, 24, 10) * 0.52; // Gobi
		value += gaussian2D(lonDeg, latDeg, 134, -25, 18, 11) * 0.48; // Australian interior
		value += gaussian2D(lonDeg, latDeg, -70, -23, 14, 8) * 0.35; // Atacama

		return clamp(value, 0, 1);
	}

	function sampleVegetation(lon: number, lat: number) {
		const lonDeg = lon * RAD_TO_DEG;
		const latDeg = lat * RAD_TO_DEG;
		let value = 0;

		value += gaussian2D(lonDeg, latDeg, 20, 0, 28, 14) * 0.45; // Equatorial Africa
		value += gaussian2D(lonDeg, latDeg, -62, -5, 24, 12) * 0.45; // Amazon basin
		value += gaussian2D(lonDeg, latDeg, 105, 8, 28, 12) * 0.4; // Southeast Asia
		value += gaussian2D(lonDeg, latDeg, 12, 48, 22, 10) * 0.3; // Europe belt

		return clamp(value, 0, 1);
	}

	function sampleMountains(lon: number, lat: number) {
		const lonDeg = lon * RAD_TO_DEG;
		const latDeg = lat * RAD_TO_DEG;
		let value = 0;

		value += gaussian2D(lonDeg, latDeg, -112, 44, 14, 8) * 0.42; // Rockies
		value += gaussian2D(lonDeg, latDeg, -72, -22, 10, 18) * 0.56; // Andes
		value += gaussian2D(lonDeg, latDeg, 10, 46, 8, 5) * 0.34; // Alps
		value += gaussian2D(lonDeg, latDeg, 85, 30, 18, 8) * 0.68; // Himalayas / Tibetan Plateau
		value += gaussian2D(lonDeg, latDeg, 38, -4, 10, 10) * 0.22; // East African Highlands

		return clamp(value, 0, 1);
	}

	function buildWorldRows(phase: number) {
		const rows: string[] = [];
		const cx = (WORLD_COLS - 1) / 2;
		const cy = (WORLD_ROWS - 1) / 2;

		for (let y = 0; y < WORLD_ROWS; y++) {
			const sy = y - cy;
			const ny = -sy / WORLD_RADIUS;
			let line = "";

			for (let x = 0; x < WORLD_COLS; x++) {
				const sx = (x - cx) * X_ASPECT;
				const nx = sx / WORLD_RADIUS;
				const dist2 = (nx * nx) + (ny * ny);

				if (dist2 > 1.018) {
					line += " ";
					continue;
				}

				if (dist2 > 0.958) {
					line += ".";
					continue;
				}

				const nz = Math.sqrt(Math.max(0, 1 - dist2));
				const lon = Math.atan2(nx, nz) + phase;
				const lat = Math.asin(-ny);
				const land = sampleLand(lon, lat);
				const relief = sampleRelief(lon, lat);
				const desert = sampleDesert(lon, lat);
				const vegetation = sampleVegetation(lon, lat);
				const mountains = sampleMountains(lon, lat);

				let pixel = "";
				const polar = clamp((Math.abs(lat) - 1.14) / 0.28, 0, 1);
				const coast = smoothstep(0.42, 0.58, land) * (1 - smoothstep(0.58, 0.74, land));
				const landCore = smoothstep(0.58, 0.76, land);
				const terrainTone = clamp(
					0.48 + (relief * 0.14) + (mountains * 0.28) + (desert * 0.2) - (vegetation * 0.1),
					0,
					1
				);
				const coastTone = clamp(0.52 + (relief * 0.08) + (desert * 0.04) - (vegetation * 0.03), 0, 1);
				const oceanTone = clamp(0.46 + (relief * 0.1), 0, 1);

				if (polar > 0.46) {
					pixel = pickRamp(" .,:;*#", clamp(0.4 + (polar * 0.5), 0, 1));
				} else if (landCore > 0.02) {
					pixel = pickRamp(" .,:;irsXA253hMHGS#9B&@", terrainTone);
				} else if (coast > 0.03) {
					pixel = pickRamp(" .,:-=", coastTone);
				} else {
					pixel = pickRamp(" `'.,-~:^=+*", oceanTone);
				}

				line += pixel;
			}

			rows.push(line);
		}

		return rows;
	}

	function startWorldSpin() {
		worldRows = buildWorldRows(worldPhase);
		worldSpinInterval = setInterval(() => {
			worldPhase += 0.044;
			worldRows = buildWorldRows(worldPhase);
		}, 115);
	}

	function stopWorldSpin() {
		clearInterval(worldSpinInterval);
	}

	function stopDescriptionReveal() {
		if (descriptionProgressHandler) {
			window.removeEventListener("scroll", descriptionProgressHandler);
			descriptionProgressHandler = undefined;
		}

		if (unlockDescriptionReveal) {
			window.removeEventListener("scroll", unlockDescriptionReveal);
			unlockDescriptionReveal = undefined;
		}
	}

	function revealDescriptionByScroll() {
		if (!descriptionLines.length) return;

		const triggerY = window.innerHeight * 0.78;
		while (nextDescriptionLine < descriptionLines.length) {
			const line = descriptionLines[nextDescriptionLine];
			if (line.getBoundingClientRect().top > triggerY) break;
			line.classList.add("is-visible");
			nextDescriptionLine += 1;
		}

		const nearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
		if (nearBottom) {
			while (nextDescriptionLine < descriptionLines.length) {
				descriptionLines[nextDescriptionLine].classList.add("is-visible");
				nextDescriptionLine += 1;
			}
		}

		if (nextDescriptionLine >= descriptionLines.length && descriptionProgressHandler) {
			window.removeEventListener("scroll", descriptionProgressHandler);
			descriptionProgressHandler = undefined;
		}
	}

	function startDescriptionReveal() {
		if (descriptionProgressHandler) return;
		descriptionProgressHandler = () => {
			revealDescriptionByScroll();
		};
		window.addEventListener("scroll", descriptionProgressHandler, { passive: true });
		revealDescriptionByScroll();
	}

	function initDescriptionReveal() {
		stopDescriptionReveal();
		descriptionLines = Array.from(document.querySelectorAll<HTMLElement>("#description p:not(:first-of-type)"));
		nextDescriptionLine = 0;

		for (const line of descriptionLines) {
			line.classList.remove("is-visible");
		}

		if (!descriptionLines.length) return;

		if (window.scrollY > 12) {
			startDescriptionReveal();
			return;
		}

		unlockDescriptionReveal = () => {
			if (window.scrollY <= 12) return;
			if (unlockDescriptionReveal) {
				window.removeEventListener("scroll", unlockDescriptionReveal);
				unlockDescriptionReveal = undefined;
			}
			startDescriptionReveal();
		};

		window.addEventListener("scroll", unlockDescriptionReveal, { passive: true });
	}

	function runContentAnimation() {
		const timeline = createTimeline();

		waapi.animate("#world pre", {
			opacity: { from: 0, to: 1, duration: 520 },
			delay: stagger(10)
		});

		const world = waapi.animate("#world", {
			opacity: { from: 0, to: 1, duration: 260 },
			rotateY: { from: "-88deg", to: "0deg", duration: 1320 },
			scaleX: { from: 0.08, to: 1, duration: 1320 }
		});

		const linkReveal = waapi.animate("#link", {
			opacity: { from: 0, to: 1, duration: 380 },
			delay: 980
		});

		timeline
			.sync(world, 0)
			.sync(linkReveal, 0)
			.call(() => {
				initDescriptionReveal();
			});
	}

	async function revealContent() {
		if (!allowReveal) return;
		showContent = true;
		await tick();
		startWorldSpin();
		runContentAnimation();
	}

	onMount(() => {
		waapi.animate("#intro-title", {
			opacity: { from: 0, to: 1, duration: 620 },
			scale: { from: 0.56, to: 1.06, duration: 680 }
		});

		waapi.animate("#intro-title", {
			opacity: { from: 1, to: 0, duration: 560, delay: 1080 },
			scale: { from: 1.06, to: 1.34, duration: 560, delay: 1080 },
			onComplete: () => {
				revealContent();
			}
		});
	});

	onNavigate(() => {
		allowReveal = false;
		stopWorldSpin();
		stopDescriptionReveal();
		utils.remove("#intro-title");
		utils.remove("#description p");
		utils.remove("#world");
		utils.remove("#world pre");
	});

	onDestroy(() => {
		allowReveal = false;
		stopWorldSpin();
		stopDescriptionReveal();
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
				<div id="world">
					{#each worldRows as row}
						<pre>{row}</pre>
					{/each}
				</div>

				<pre id="link">
○ Connecting   |   AnA <ArrowConnect/> Sunrin Internet High School
○ Connecting   |   AnA <ArrowConnect delay={600}/> World
				</pre>

				<div id="description">
					<p>안녕하세요! 👋</p>
					<p>저희는 2011년부터 선린인터넷고등학교 소프트웨어과의 전공 동아리로 활동한 AnA입니다.</p>
					<p>10년이 넘는 시간 동안 AnA는 지속적인 도전과 전진으로 새로운 미래와 혁신을 이끌어 가고 있습니다.</p>
					<br/>
					<p>처음 Algorithm & Application이라는 알고리즘 동아리로 시작하여, </p>
					<p>이후 Android & App이라는 이름으로 활동하며 안드로이드 애플리케이션 개발을 중심으로 성과를 쌓아왔습니다. </p>
					<p>이후 Application & Architecture로 변화를 맞이하며, </p>
					<p>애플리케이션 개발뿐만 아니라 이를 뒷받침하는 아키텍처 설계와 서버 구축까지 다루는 동아리로 성장했습니다.</p>
					<br/>
					<p>16년간 AnA는 기술을 배우는 것을 넘어, </p>
					<p>이를 통해 세상에 긍정적인 변화를 만들어내는 도전과 성취의 장이었습니다.</p>
					<p>그리고 2026년, AnA 는 새로운 역사를 써 내려갈 준비를 하고 있습니다. </p>
					<br/>
					<p>AnA - 우리의 도전은 멈추지 않습니다.</p>
				</div>
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		margin: 5rem auto 0;
		padding: 0 3rem clamp(9rem, 22vh, 14rem);
		max-width: 1200px;
		box-sizing: border-box;
	}

	section {
		width: 100%;
	}

	main * {
		font-family: "JetBrains Mono", monospace;
		font-optical-sizing: auto;
	}

	#intro-overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f9f9f9;
		z-index: 80;
		pointer-events: none;
	}

	#intro-title {
		margin: 0;
		font-size: clamp(2.5rem, 9vw, 6.4rem);
		letter-spacing: 0.08em;
		text-align: center;
		opacity: 0;
		transform: scale(0.56);
	}

	#description p {
		font-family: "RoundedFixedsys";
		width: min(100%, 72ch);
		margin: 0 auto;
		text-align: left;
		opacity: 0;
		visibility: hidden;
		transform: translateY(14px);
		transition: opacity 320ms ease, transform 320ms ease;
	}

	#description p:first-of-type,
	:global(#description p.is-visible) {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	#description {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: clamp(1rem, 3vw, 1.5rem);
	}

	#world-stage {
		width: 100%;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		perspective: 1200px;
	}

	#world {
		display: inline-block;
		position: relative;
		transform-origin: center;
		transform-style: preserve-3d;
		opacity: 0;
		will-change: transform, opacity;
	}

	#world pre {
		margin: 0;
		font-size: clamp(0.43rem, 1.2vw, 0.67rem);
		line-height: clamp(0.5rem, 1.35vw, 0.76rem);
		letter-spacing: clamp(0rem, 0.02vw, 0.015rem);
		opacity: 0;
	}

	#link {
		opacity: 0;
		color: #111;
		max-width: 100%;
		text-align: center;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: clamp(0.5rem, 1.05vw, 0.95rem);
		line-height: 1.35;
	}

	@media (min-width: 1024px) {
		#description {
			margin-top: clamp(5rem, 16vh, 10rem);
		}
	}

	@media (max-width: 768px) {
		main {
			margin-top: 4.5rem;
			padding: 0 1rem clamp(12rem, 26vh, 17rem);
		}

		#intro-title {
			font-size: clamp(2rem, 11vw, 3.2rem);
			letter-spacing: 0.04em;
		}

		#description {
			width: 100%;
		}

		#description p {
			font-size: 0.88rem;
			line-height: 1.5;
		}
	}

	@media (max-width: 430px) {
		main {
			margin-top: 4.25rem;
			padding: 0 0.5rem clamp(13rem, 30vh, 19rem);
		}

		#link {
			font-size: 0.5rem;
			line-height: 1.25;
		}

		#description p {
			font-size: 0.8rem;
			line-height: 1.42;
		}
	}

</style>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
</svelte:head>
