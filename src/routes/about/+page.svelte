<script lang="ts">
	import Nav from "$lib/Nav.svelte";
	import { onDestroy, onMount, tick } from "svelte";
	import { onNavigate } from "$app/navigation";
	import { waapi, stagger, onScroll, createTimeline, utils } from "animejs";
	import ArrowConnect from "$lib/ArrowConnect.svelte";

	const WORLD_COLS = 78;
	const WORLD_ROWS = 38;
	const WORLD_RADIUS = 17.6;
	const X_ASPECT = 0.5;
	const RAD_TO_DEG = 180 / Math.PI;

	type GeoPolygon = Array<[number, number]>;
	type LandmarkSite = { lonDeg: number; latDeg: number; size: number };
	type LandmarkRender = { left: number; top: number; scale: number; opacity: number };

	const LAND_POLYGONS: GeoPolygon[] = [
		[
			[-168, 72], [-140, 73], [-126, 66], [-111, 57], [-99, 49], [-92, 49], [-83, 26], [-98, 14],
			[-106, 18], [-114, 24], [-121, 31], [-128, 41], [-137, 49], [-151, 58], [-165, 62]
		],
		[
			[-81, 12], [-74, 10], [-67, 5], [-62, -3], [-58, -12], [-55, -22], [-52, -33], [-55, -45],
			[-63, -54], [-72, -53], [-78, -40], [-75, -20], [-79, -5]
		],
		[
			[-74, 83], [-40, 83], [-26, 73], [-35, 60], [-50, 58], [-62, 66]
		],
		[
			[-11, 36], [-6, 43], [2, 45], [12, 46], [22, 52], [30, 60], [40, 63], [42, 55], [34, 46],
			[25, 42], [16, 38], [8, 36], [2, 35]
		],
		[
			[-18, 37], [-8, 36], [2, 37], [14, 35], [25, 32], [33, 24], [35, 15], [43, 12], [51, 11],
			[48, 4], [44, -10], [36, -21], [28, -30], [17, -35], [7, -35], [-3, -28], [-10, -15],
			[-15, 1], [-17, 18]
		],
		[
			[37, 31], [50, 29], [57, 22], [56, 16], [48, 12], [43, 16], [40, 24]
		],
		[
			[26, 8], [40, 8], [51, 16], [61, 22], [70, 30], [82, 34], [92, 44], [108, 54], [130, 55],
			[147, 48], [152, 37], [141, 29], [121, 24], [108, 16], [96, 10], [86, 8], [75, 12],
			[64, 16], [52, 10], [40, 4], [30, 0]
		],
		[
			[67, 24], [77, 29], [88, 24], [84, 10], [76, 8], [70, 14]
		],
		[
			[95, 8], [108, 7], [115, 0], [112, -5], [104, -6], [97, -1]
		],
		[
			[129, 31], [142, 45], [147, 38], [139, 32]
		],
		[
			[112, -11], [154, -11], [153, -39], [131, -43], [114, -34]
		],
		[
			[44, -13], [51, -16], [50, -25], [45, -26]
		]
	];

	const LAND_SAMPLE_KERNEL: Array<[number, number, number]> = [
		[0, 0, 0.52],
		[1.2, 0, 0.11],
		[-1.2, 0, 0.11],
		[0, 1.2, 0.1],
		[0, -1.2, 0.1],
		[2.4, 0, 0.03],
		[-2.4, 0, 0.03]
	];

	const LANDMARK_SITES: LandmarkSite[] = [
		{ lonDeg: -100, latDeg: 40, size: 0.86 }, // North America
		{ lonDeg: -60, latDeg: -15, size: 0.84 }, // South America
		{ lonDeg: 12, latDeg: 50, size: 0.82 },   // Europe
		{ lonDeg: 20, latDeg: 6, size: 0.88 },    // Africa
		{ lonDeg: 105, latDeg: 34, size: 0.84 },  // Asia
		{ lonDeg: 134, latDeg: -25, size: 0.86 }, // Oceania (Australia)
		{ lonDeg: 30, latDeg: -76, size: 0.8 }    // Antarctica
	];

	let showContent = false;
	let allowReveal = true;
	let worldPhase = 0.33;
	let worldRows: string[] = buildWorldRows(worldPhase);
	let landmarks: LandmarkRender[] = projectLandmarks(worldPhase);
	let worldSpinInterval: ReturnType<typeof setInterval> | undefined;
	let firstDotActive = false;
	let secondDotActive = false;
	let firstDotHold = 0;
	let secondDotHold = 0;
	const DOT_HOLD_STEPS = 3;

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

	function degToRad(deg: number) {
		return deg / RAD_TO_DEG;
	}

	function wrapDeltaDeg(a: number, b: number) {
		let delta = Math.abs(a - b) % 360;
		if (delta > 180) delta = 360 - delta;
		return delta;
	}

	function pointInPolygon(lonDeg: number, latDeg: number, polygon: GeoPolygon) {
		let inside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const [xi, yi] = polygon[i];
			const [xj, yj] = polygon[j];
			const intersects = ((yi > latDeg) !== (yj > latDeg)) &&
				(lonDeg < (((xj - xi) * (latDeg - yi)) / ((yj - yi) || 1e-9)) + xi);
			if (intersects) inside = !inside;
		}
		return inside;
	}

	function isLand(lonDeg: number, latDeg: number) {
		if (latDeg < -71.5) return true;
		const lon = normalizeLonDeg(lonDeg);
		for (const polygon of LAND_POLYGONS) {
			if (pointInPolygon(lon, latDeg, polygon)) return true;
		}
		return false;
	}

	function sampleLand(lon: number, lat: number) {
		const lonDeg = lon * RAD_TO_DEG;
		const latDeg = lat * RAD_TO_DEG;
		let sum = 0;
		for (const [dx, dy, weight] of LAND_SAMPLE_KERNEL) {
			if (isLand(lonDeg + dx, latDeg + dy)) sum += weight;
		}
		return clamp(sum, 0, 1);
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

		return clamp(value, 0, 1);
	}

	function sampleVegetation(lon: number, lat: number) {
		const lonDeg = lon * RAD_TO_DEG;
		const latDeg = lat * RAD_TO_DEG;
		let value = 0;

		value += gaussian2D(lonDeg, latDeg, 20, 0, 28, 14) * 0.45; // Equatorial Africa
		value += gaussian2D(lonDeg, latDeg, 12, 48, 22, 10) * 0.3; // Europe belt

		return clamp(value, 0, 1);
	}

	function buildWorldRows(phase: number) {
		const rows: string[] = [];
		const cx = (WORLD_COLS - 1) / 2;
		const cy = (WORLD_ROWS - 1) / 2;

		for (let y = 0; y < WORLD_ROWS; y++) {
			const sy = y - cy;
			const ny = sy / WORLD_RADIUS;
			let line = "";

			for (let x = 0; x < WORLD_COLS; x++) {
				const sx = (x - cx) * X_ASPECT;
				const nx = sx / WORLD_RADIUS;
				const dist2 = (nx * nx) + (ny * ny);

				if (dist2 > 1.03) {
					line += " ";
					continue;
				}

				if (dist2 > 0.968) {
					line += ".";
					continue;
				}

				const nz = Math.sqrt(Math.max(0, 1 - dist2));
				const lon = Math.atan2(nx, nz) + phase;
				const lat = Math.asin(ny);
				const land = sampleLand(lon, lat);
				const relief = sampleRelief(lon, lat);
				const desert = sampleDesert(lon, lat);
				const vegetation = sampleVegetation(lon, lat);

				let light = clamp(0.08 + (nz * 0.95) + (nx * 0.4) + (ny * 0.1), 0, 1);
				const rim = clamp((0.996 - dist2) / 0.3, 0, 1);
				light *= 0.62 + (rim * 0.44);

				let pixel = "";
				const polar = clamp((Math.abs(lat) - 1.17) / 0.3, 0, 1);
				const coast = smoothstep(0.44, 0.6, land) * (1 - smoothstep(0.64, 0.8, land));
				const landCore = smoothstep(0.66, 0.86, land);

				if (polar > 0.44) {
					pixel = pickRamp(" .:*#", (light * 0.8) + (polar * 0.36));
				} else if (landCore > 0.02) {
					const terrain = clamp(
						(light * 0.72) + (relief * 0.14) + (desert * 0.24) - (vegetation * 0.1),
						0,
						1
					);
					pixel = pickRamp(".,:;=+*#%@", terrain);
				} else if (coast > 0.03) {
					const coastShade = clamp((light * 0.67) + (coast * 0.32), 0, 1);
					pixel = pickRamp(".,:;-", coastShade);
				} else {
					const oceanShade = clamp((light * 0.56) + (relief * 0.03), 0, 1);
					pixel = pickRamp("`'.,-~", oceanShade);
				}

				line += pixel;
			}

			rows.push(line);
		}

		return rows;
	}

	function projectLandmarks(phase: number) {
		const cx = (WORLD_COLS - 1) / 2;
		const cy = (WORLD_ROWS - 1) / 2;
		const projected: Array<LandmarkRender & { depth: number }> = [];

		for (const site of LANDMARK_SITES) {
			const lon = degToRad(site.lonDeg);
			const lat = degToRad(site.latDeg);
			const theta = lon - phase;
			const cosLat = Math.cos(lat);
			const nx = Math.sin(theta) * cosLat;
			const ny = Math.sin(lat);
			const nz = Math.cos(theta) * cosLat;

			if (nz <= 0.06) continue;

			const xChar = cx + ((nx * WORLD_RADIUS) / X_ASPECT);
			const yChar = cy + (ny * WORLD_RADIUS);
			const left = ((xChar + 0.5) / WORLD_COLS) * 100;
			const top = ((yChar + 0.5) / WORLD_ROWS) * 100;

			const depth = clamp((nz - 0.06) / 0.94, 0, 1);
			projected.push({
				left,
				top,
				scale: (0.86 + (depth * 0.54)) * site.size,
				opacity: 0.72 + (depth * 0.28),
				depth
			});
		}

		projected.sort((a, b) => a.depth - b.depth);
		return projected;
	}

	function startWorldSpin() {
		worldRows = buildWorldRows(worldPhase);
		landmarks = projectLandmarks(worldPhase);
		worldSpinInterval = setInterval(() => {
			worldPhase += 0.044;
			worldRows = buildWorldRows(worldPhase);
			landmarks = projectLandmarks(worldPhase);
		}, 115);
	}

	function stopWorldSpin() {
		clearInterval(worldSpinInterval);
	}

	function syncFirstDot(step: number, width: number, dir: number) {
		if (step === width - 1 && dir > 0) firstDotHold = DOT_HOLD_STEPS;
		else firstDotHold = Math.max(0, firstDotHold - 1);
		firstDotActive = firstDotHold > 0;
	}

	function syncSecondDot(step: number, width: number, dir: number) {
		if (step === width - 1 && dir > 0) secondDotHold = DOT_HOLD_STEPS;
		else secondDotHold = Math.max(0, secondDotHold - 1);
		secondDotActive = secondDotHold > 0;
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
				waapi.animate("#description p", {
					opacity: { from: 0, to: 1, duration: 1, delay: stagger(150) },
					delay: 1000,
					autoplay: onScroll({
						sync: 1,
						enter: "max bottom",
						leave: "min bottom"
					})
				});
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
		utils.remove("#intro-title");
		utils.remove("#description p");
		utils.remove("#world");
		utils.remove("#world pre");
	});

	onDestroy(() => {
		allowReveal = false;
		stopWorldSpin();
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
					<div class="landmark-layer">
						{#each landmarks as landmark}
							<span
								class="ana-landmark"
								style={`left:${landmark.left}%;top:${landmark.top}%;--landmark-scale:${landmark.scale};--landmark-opacity:${landmark.opacity};`}
							>
								<img src="/logo.svg" alt="AnA logo" loading="lazy" draggable="false" />
							</span>
						{/each}
					</div>
				</div>

				<pre id="link">
<span class="status-dot" class:active={firstDotActive}>●</span> Connecting   |   AnA <span class="signal-track signal-track-a"><ArrowConnect onStep={syncFirstDot}/></span> Sunrin Internet High School
<span class="status-dot" class:active={secondDotActive}>●</span> Connecting   |   AnA <span class="signal-track signal-track-b"><ArrowConnect delay={600} onStep={syncSecondDot}/></span> World
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
		margin-top: 5rem;
		margin: 5rem 3rem 0 3rem;
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
	}

	#world-stage {
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
		font-size: 0.73rem;
		line-height: 0.84rem;
		letter-spacing: 0.02rem;
		opacity: 0;
	}

	#world .landmark-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 4;
	}

	#world .ana-landmark {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 0.75rem;
		height: 0.75rem;
		transform: translate(-50%, -50%) scale(var(--landmark-scale, 1));
		opacity: var(--landmark-opacity, 1);
	}

	#world .ana-landmark img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		user-select: none;
		filter: drop-shadow(0 0 0.14rem rgba(0, 0, 0, 0.75));
	}

	#description p {
		opacity: 0;
	}

	#link {
		opacity: 0;
		color: #111;
	}

	#link .status-dot {
		color: #3f3f3f;
		transition: color 80ms linear, text-shadow 80ms linear;
	}

	#link .status-dot.active {
		color: #95ff6c;
		text-shadow: 0 0 0.42rem rgba(149, 255, 108, 0.95);
	}

	#link .signal-track {
		--signal-base-color: #666666;
		--signal-light-color: #95ff6c;
		--signal-light-transition: 90ms;
	}

	#link .signal-track-a {
		--signal-light-transition: 90ms;
	}

	#link .signal-track-b {
		--signal-light-transition: 130ms;
	}
</style>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
</svelte:head>
