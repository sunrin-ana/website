<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import earthLandMask from "$lib/earth-land-mask.json";

	// ── 지구본 상수 ──
	const WORLD_COLS = 74;
	const WORLD_ROWS = 36;
	const WORLD_RADIUS = 16.8;
	let X_ASPECT = 0.54;
	const RAD_TO_DEG = 180 / Math.PI;

	const LAND_MASK_WIDTH = earthLandMask.width;
	const LAND_MASK_HEIGHT = earthLandMask.height;

	function decodeMaskBits(base64: string) {
		const raw = atob(base64);
		const bytes = new Uint8Array(raw.length);
		for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
		return bytes;
	}
	const LAND_MASK_BITS = decodeMaskBits(earthLandMask.data);

	let resizeObserver: ResizeObserver | undefined;

	function measureCharAspect(): number {
		if (typeof document === 'undefined') return 0.54;
		const el = document.createElement('pre');
		el.style.cssText = [
			'position:fixed', 'top:-9999px', 'left:-9999px',
			'visibility:hidden', 'pointer-events:none',
			"font-family:'SFMono-Terminal','IBM Plex Mono',Menlo,Monaco,Consolas,'Courier New',monospace",
			'font-size:0.75rem', 'line-height:1.111em', 'letter-spacing:0',
			'white-space:pre', 'margin:0', 'padding:0'
		].join(';');
		el.textContent = 'X'.repeat(50) + '\n' + 'X'.repeat(50);
		document.body.appendChild(el);
		const rect = el.getBoundingClientRect();
		document.body.removeChild(el);
		const lineH = rect.height / 2;
		const charW = rect.width / 50;
		return (charW > 0 && lineH > 0) ? charW / lineH : 0.54;
	}

	function updateGlobeSize() {
		if (typeof document === 'undefined') return;
		const stageEl = document.getElementById('world-stage');
		const worldEl = document.getElementById('world');
		if (!stageEl || !worldEl) return;
		const px = Math.max(4, Math.min(13.5, stageEl.clientWidth * 0.013));
		worldEl.style.fontSize = px + 'px';
	}

	function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
	function normalizeLonDeg(d: number) { let w = (d + 180) % 360; if (w < 0) w += 360; return w - 180; }
	function pickRamp(chars: string, v: number) { return chars[Math.floor(clamp(v, 0, 0.9999) * chars.length)]; }
	function smoothstep(e0: number, e1: number, x: number) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
	function wrapDeltaDeg(a: number, b: number) { let d = Math.abs(a - b) % 360; if (d > 180) d = 360 - d; return d; }
	function readLandBit(x: number, y: number) {
		const wx = ((x % LAND_MASK_WIDTH) + LAND_MASK_WIDTH) % LAND_MASK_WIDTH;
		const cy2 = clamp(y, 0, LAND_MASK_HEIGHT - 1);
		const idx = cy2 * LAND_MASK_WIDTH + wx;
		return (LAND_MASK_BITS[idx >> 3] >> (idx & 7)) & 1;
	}
	function sampleLandMask(lonDeg: number, latDeg: number) {
		const lon = normalizeLonDeg(lonDeg);
		const u = ((lon + 180) / 360) * (LAND_MASK_WIDTH - 1);
		const v = ((90 - latDeg) / 180) * (LAND_MASK_HEIGHT - 1);
		const x0 = Math.floor(u), y0 = Math.floor(v);
		const x1 = (x0 + 1) % LAND_MASK_WIDTH, y1 = Math.min(LAND_MASK_HEIGHT - 1, y0 + 1);
		const tx = u - x0, ty = v - y0;
		const a = readLandBit(x0, y0), b = readLandBit(x1, y0), c = readLandBit(x0, y1), d = readLandBit(x1, y1);
		return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
	}
	function sampleLand(lon: number, lat: number) { return sampleLandMask(lon * RAD_TO_DEG, lat * RAD_TO_DEG); }
	function sampleRelief(lon: number, lat: number) {
		return Math.sin(lon * 2.8 + lat * 1.4) * 0.22 + Math.cos(lon * 4.9 - lat * 3.1) * 0.14 + Math.sin((lon - lat) * 6.2) * 0.09;
	}
	function gaussian2D(lo: number, la: number, cLo: number, cLa: number, sLo: number, sLa: number) {
		const dLo = wrapDeltaDeg(lo, cLo) / sLo, dLa = (la - cLa) / sLa;
		return Math.exp(-(dLo * dLo + dLa * dLa));
	}
	function sampleDesert(lon: number, lat: number) {
		const lo = lon * RAD_TO_DEG, la = lat * RAD_TO_DEG;
		return clamp(gaussian2D(lo,la,15,23,30,14)*0.9+gaussian2D(lo,la,28,18,16,10)*0.6+gaussian2D(lo,la,45,24,20,10)*0.6+gaussian2D(lo,la,100,42,24,10)*0.52+gaussian2D(lo,la,134,-25,18,11)*0.48+gaussian2D(lo,la,-70,-23,14,8)*0.35,0,1);
	}
	function sampleVegetation(lon: number, lat: number) {
		const lo = lon * RAD_TO_DEG, la = lat * RAD_TO_DEG;
		return clamp(gaussian2D(lo,la,20,0,28,14)*0.45+gaussian2D(lo,la,-62,-5,24,12)*0.45+gaussian2D(lo,la,105,8,28,12)*0.4+gaussian2D(lo,la,12,48,22,10)*0.3,0,1);
	}
	function sampleMountains(lon: number, lat: number) {
		const lo = lon * RAD_TO_DEG, la = lat * RAD_TO_DEG;
		return clamp(gaussian2D(lo,la,-112,44,14,8)*0.42+gaussian2D(lo,la,-72,-22,10,18)*0.56+gaussian2D(lo,la,10,46,8,5)*0.34+gaussian2D(lo,la,85,30,18,8)*0.68+gaussian2D(lo,la,38,-4,10,10)*0.22,0,1);
	}
	function buildWorldRows(phase: number) {
		const rows: string[] = [];
		const cx = (WORLD_COLS - 1) / 2, cy = (WORLD_ROWS - 1) / 2;
		for (let y = 0; y < WORLD_ROWS; y++) {
			const ny = -(y - cy) / WORLD_RADIUS;
			let line = "";
			for (let x = 0; x < WORLD_COLS; x++) {
				const nx = (x - cx) * X_ASPECT / WORLD_RADIUS;
				const dist2 = nx * nx + ny * ny;
				if (dist2 > 1.018) { line += " "; continue; }
				if (dist2 > 0.958) { line += "."; continue; }
				const nz = Math.sqrt(Math.max(0, 1 - dist2));
				const lon = Math.atan2(nx, nz) + phase, lat = Math.asin(ny);
				const land = sampleLand(lon, lat), relief = sampleRelief(lon, lat);
				const desert = sampleDesert(lon, lat), veg = sampleVegetation(lon, lat), mnt = sampleMountains(lon, lat);
				const polar = clamp((Math.abs(lat) - 1.14) / 0.28, 0, 1);
				const coast = smoothstep(0.42, 0.58, land) * (1 - smoothstep(0.58, 0.74, land));
				const landCore = smoothstep(0.58, 0.76, land);
				let pixel = "";
				if (polar > 0.46) pixel = pickRamp(" .,:;*#", clamp(0.4 + polar*0.5, 0, 1));
				else if (landCore > 0.02) pixel = pickRamp(" .,:;irsXA253hMHGS#9B&@", clamp(0.48+relief*0.14+mnt*0.28+desert*0.2-veg*0.1,0,1));
				else if (coast > 0.03) pixel = pickRamp(" .,:-=", clamp(0.52+relief*0.08+desert*0.04-veg*0.03,0,1));
				else pixel = pickRamp(" `'.,-~:^=+*", clamp(0.46+relief*0.1,0,1));
				line += pixel;
			}
			rows.push(line);
		}
		return rows;
	}

	let worldPhase = 0.33 + Math.PI;
	export let worldRows: string[] = buildWorldRows(worldPhase);
	let worldSpinInterval: ReturnType<typeof setInterval> | undefined;

	export function startSpin() {
		stopSpin();
		worldSpinInterval = setInterval(() => { 
			worldPhase += 0.044; 
			worldRows = buildWorldRows(worldPhase); 
		}, 115);
	}
	export function stopSpin() { 
		if (worldSpinInterval) clearInterval(worldSpinInterval); 
	}

	onMount(async () => {
		await document.fonts.ready;
		X_ASPECT = measureCharAspect();
		worldRows = buildWorldRows(worldPhase);
		updateGlobeSize();
		const stageEl = document.getElementById('world-stage');
		if (stageEl) {
			resizeObserver = new ResizeObserver(() => updateGlobeSize());
			resizeObserver.observe(stageEl);
		}
	});

	onDestroy(() => {
		stopSpin();
		resizeObserver?.disconnect();
	});
</script>

<div id="world">
	{#each worldRows as row}
		<pre style="opacity:0">{row}</pre>
	{/each}
</div>

<style>
	#world {
		display: inline-block;
		transform-origin: center;
		opacity: 0;
		-webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 55%, transparent 90%);
		mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 55%, transparent 90%);
	}
	#world pre {
		margin: 0;
		line-height: 1.111em;
		letter-spacing: 0;
		font-weight: 800;
		color: #1a1a1a7a;
	}
</style>
