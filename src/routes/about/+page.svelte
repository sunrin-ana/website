<script lang="ts">
	import Nav from "$lib/Nav.svelte";
	import { onDestroy, tick } from "svelte";
	import { onNavigate, afterNavigate } from "$app/navigation";
	import { waapi, utils } from "animejs";
	import ArrowConnect from "$lib/ArrowConnect.svelte";
	import earthLandMask from "$lib/earth-land-mask.json";

	// ── 지구본 상수 ──
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
		for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
		return bytes;
	}
	const LAND_MASK_BITS = decodeMaskBits(earthLandMask.data);

	let showContent = false;
	let allowReveal = true;
	let worldPhase = 0.33 + Math.PI;
	let worldRows: string[] = buildWorldRows(worldPhase);
	let worldSpinInterval: ReturnType<typeof setInterval> | undefined;
	let activeInterval: ReturnType<typeof setInterval> | undefined;
	let activeTimeouts: ReturnType<typeof setTimeout>[] = [];

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

	// ── 지구본 렌더링 ──
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

	function startWorldSpin() {
		worldRows = buildWorldRows(worldPhase);
		worldSpinInterval = setInterval(() => { worldPhase += 0.044; worldRows = buildWorldRows(worldPhase); }, 115);
	}
	function stopWorldSpin() { clearInterval(worldSpinInterval); }

	// ── 유틸 ──
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

	// ── 메인 시퀀스 ──
	async function runSequence() {
		if (!allowReveal) return;

		// 1. boot-prompt 타이핑
		const bootEl = qs('.boot-prompt');
		const bootTyped = qs<HTMLElement>('.boot-typed');
		const bootCur = qs<HTMLElement>('.boot-cur');
		show(bootEl);
		if (bootTyped) await typeCommand(bootTyped, 'boot --connect-world');
		if (!allowReveal) return;
		await sleep(200);

		// 2. 지구 스핀 시작 후 위 줄부터 한 줄씩 표시
		startWorldSpin();
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

		// 커서 숨김
		if (bootCur) bootCur.style.opacity = '0';

		await sleep(250);

		// 3. 링크 텍스트 타이핑 (각 줄: 앞글자 → 화살표 → 뒷글자)
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

		// 4. 섹션별 프롬프트 타이핑 → 콘텐츠 공개
		const steps = Array.from(document.querySelectorAll<HTMLElement>('.term-step'));
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
	}

	async function revealContent() {
		if (!allowReveal) return;
		showContent = true;
		await tick();
		runSequence();
	}

	// ── 인트로: 원래 "We're connecting the world" ──
	afterNavigate(async () => {
		allowReveal = true;
		showContent = false;
		uptimeString = getPreciseUptime();
		clearInterval(worldSpinInterval);
		clearInterval(activeInterval);
		activeTimeouts.forEach(clearTimeout);
		activeTimeouts = [];
		worldPhase = 0.33 + Math.PI;
		worldRows = buildWorldRows(worldPhase);

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
		stopWorldSpin();
		utils.remove("#intro-title");
		utils.remove("#link");
	});

	onDestroy(() => {
		allowReveal = false;
		clearInterval(activeInterval);
		activeTimeouts.forEach(clearTimeout);
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
				<!-- boot 커맨드 (지구 위) -->
				<div class="boot-prompt" style="opacity:0">
					<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="boot-typed"></span><span class="boot-cur blink">_</span>
				</div>

				<!-- 지구본 -->
				<div id="world" style="opacity:0">
					{#each worldRows as row}
						<pre style="opacity:0">{row}</pre>
					{/each}
				</div>

				<!-- 연결 텍스트 -->
				<div id="link" style="opacity:1">
					<div class="link-line">
						<span class="lp1"></span><span class="la1" style="opacity:0"><ArrowConnect/></span><span class="ls1"></span>
					</div>
					<div class="link-line">
						<span class="lp2"></span><span class="la2" style="opacity:0"><ArrowConnect delay={600}/></span><span class="ls2"></span>
					</div>
				</div>

				<!-- 터미널 섹션들 -->
				<div id="terminal-body">

					<div class="term-step">
						<div class="type-prompt" data-cmd="./profile --view" style="opacity:0">
							<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="prompt-typed"></span><span class="prompt-cur blink">_</span>
						</div>
						<div class="term-content" style="opacity:0;transform:translateY(8px)">
							<pre class="anafetch-pre">
							<br>
<span class="logo-c">               xMMMMMMMMN               </span>  <span class="info-key">ana</span>@<span class="info-key">ana</span>
<span class="logo-c">              ,MMMMMMMMMMl              </span>  -------
<span class="logo-c">             .WMMMMMMMMMMM'             </span>  <span class="info-key">OS</span>: Application &amp; Architecture 17 neurons
<span class="logo-c">             NMMMMMMMMMMMMW.            </span>  <span class="info-key">Host</span>: Sunrin Internet High School Rev 121.0
<span class="logo-c">            KMMMMMN  OMMMMMN            </span>  <span class="info-key">Kernel</span>: 120th-dept-sw (<span class="effect">! UPDATE REQUIRED</span>)
<span class="logo-c">           OMMMMMM.   MMMMMMX           </span>  <span class="info-key">Uptime</span>: {uptimeString}
<span class="logo-c">          oMMMMMM;    .MMMMMMd          </span>  <span class="info-key">Packages</span>: 4 (class)
<span class="logo-c">         .MMMMMMk      oMMMMMM,         </span>  <span class="info-key">Shell</span>: An-Shell 17.0.0
<span class="logo-c">         WMMMMMMc       NMMMMMW.        </span>  <span class="info-key">CPU</span>: 86B * 10 @ neurons
<span class="logo-c">        KMMMMMMMW       .MMMMMMN        </span>  <span class="info-key">Memory</span>: 16B * 10 neurons
<span class="logo-c">       kMMMMMMMMMO       :MMMMMMK       </span>
<span class="logo-c">      lMMMMMMN xMM;       OMMMMMMk      </span>  <span class="info-key">Email</span>: ana@sunrint.hs.kr
<span class="logo-c">     'MMMMMMM   WMW        MMMMMMMl     </span>  <span class="info-key">Location</span>: 341 @ SRIHS
<span class="logo-c">    .WMMMMMM,   'MMX       .MMMMMMM'    </span>
<span class="logo-c">    NMMMMMMx     xMMd       cMMMMMMW    </span>
<span class="logo-c">   0MMMMMMN       WMM.       0MMMMMMX   </span>
<span class="logo-c">  oMMMMMMM        .MMW        MMMMMMMO  </span>
<span class="logo-c"> ,MMMMMMMc         cMM0.......NMMMMMMMo </span>
<span class="logo-c">.WMMMMMMX           0MMMMMMMMMMMMMMMMMM,</span>
<span class="logo-c">KMMMMMMM;           ,MMMMMMMMMMMMMMMMMMW</span>
							</pre>
						</div>
					</div>

					<div class="term-step">
						<div class="type-prompt" data-cmd="cat specs.log" style="opacity:0">
							<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="prompt-typed"></span><span class="prompt-cur blink">_</span>
						</div>
						<div class="term-content" style="opacity:0;transform:translateY(8px)">
							<div class="nf-section">
								<div class="spec-list">
									<div class="spec-item"><span class="tag">[FRONTEND]</span> React, Next.js, Svelte, Swift, etc.</div>
									<div class="spec-item"><span class="tag">[BACKEND]</span> Spring, Node.js, Go, FastAPI, Java, Flask, etc.</div>
									<div class="spec-item"><span class="tag">[INFRA]</span> Docker, SQL, MongoDB, etc.</div>
								</div>
							</div>
						</div>
					</div>

					<!-- 마지막 커서 -->
					<div class="term-step">
						<div class="type-prompt" data-cmd="" style="opacity:0">
							<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="prompt-cur blink">█</span>
						</div>
						<div class="term-content"></div>
					</div>

				</div>
			</div>
		{/if}
	</section>
</main>

<footer>
	<span>© 2025 AnA — Application & Architecture</span>
	<span class="footer-links">
		<button onclick={() => window.open('https://www.facebook.com/sunrinana/', '_blank')} type="button">Facebook</button>
		<button onclick={() => window.open('https://instagram.com/sunrin_ana', '_blank')} type="button">Instagram</button>
		<button onclick={() => window.open('https://github.com/sunrin-ana', '_blank')} type="button">GitHub</button>
	</span>
</footer>

<style>
	main {
		margin: 5rem auto 0;
		padding: 0 3rem 2rem;
		max-width: 1100px;
		box-sizing: border-box;
		font-family: Menlo, Monaco, monospace;
		font-size: 13px;
		font-weight: 400;
		line-height: 1.25;
		letter-spacing: -0.3px;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		font-variant-ligatures: none;
	}
	section { width: 100%; }

	/* ── 인트로 ── */
	#intro-overlay {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: #f9f9f9; z-index: 80; pointer-events: none;
	}
	#intro-title {
		margin: 0;
		font-size: clamp(2.5rem, 9vw, 6.4rem);
		font-family: "Pretendard Variable", Pretendard, sans-serif;
		font-weight: 700;
		letter-spacing: -0.01em;
		text-align: center;
		opacity: 0;
		transform: scale(0.56);
	}

	/* ── 지구 줄 등장 틱 효과 ── */
	@keyframes globe-tick {
		0%   { filter: brightness(4) blur(0.4px); }
		20%  { filter: brightness(1.8); }
		55%  { filter: brightness(0.85); }
		100% { filter: brightness(1); }
	}

	/* ── 프롬프트 공통 색상 ── */
	.p-user  { color: #2e7d32; font-weight: 800; letter-spacing: -1px;}
	.p-sep   { color: #555; letter-spacing: -1px;}
	.p-path  { color: #1565c0; font-weight: 700; }
	.p-dollar { color: #333; }
	.blink { animation: blink 1s step-end infinite; }
	@keyframes blink { 50% { opacity: 0; } }

	/* ── profile (anafetch) ── */
	.anafetch-pre {
		font-size: clamp(0.5rem, 1.1vw, 0.75rem);
		line-height: 1.2;
		margin: 0;
		padding-bottom: 1.5rem;
		color: #333;
		overflow-x: auto;
	}
	.logo-c {
		color: #282828;
		font-size: clamp(0.43rem, 1.2vw, 0.75rem);
		line-height: 1.111em;
		letter-spacing: 0;
		font-weight: 600;
	}
	.info-key { color: hwb(183 26% 45%); font-weight: 900; letter-spacing: -1px; }
	.effect { color: hsl(30, 100%, 35%); }

	/* ── 월드 스테이지 ── */
	#world-stage {
		width: 100%;
		display: flex; flex-flow: column;
		align-items: center;
	}

	/* boot 커맨드 줄 */
	.boot-prompt {
		width: 100%;
		font-size: clamp(0.75rem, 1.8vw, 1rem);
		margin-bottom: 1rem;
		color: #333;
	}

	/* ── 지구본 ── */
	#world {
		display: inline-block;
		transform-origin: center;
		-webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 55%, transparent 90%);
		mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 55%, transparent 90%);
	}
	#world pre {
		margin: 0;
		
		font-size: clamp(0.43rem, 1.2vw, 0.75rem);
		line-height: 1.111em;
		letter-spacing: -1;
		font-weight: 400;
		color: #1a1a1a7a;
	}

	/* ── 링크 텍스트 ── */
	#link {
		margin: 1.2rem 0 0;
		font-size: clamp(0.7rem, 1.8vw, 0.95rem);
		line-height: 1.8;
		color: #444;
		text-align: left;
	}
	.link-line {
		display: block;
		white-space: pre;
	}

	/* ── 터미널 바디 ── */
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

	/* ── tech stack ── */
	.nf-section { padding-bottom: 1.5rem; }
	/* .nf-header {
		font-weight: 700;
		font-size: clamp(0.75rem, 1.8vw, 1rem);
		color: #334882;
		margin-bottom: 0.5rem;
		border-left: 3px solid #334882;
		padding-left: 0.6rem;
	} */
	.spec-list { display: flex; flex-direction: column; gap: 0.3rem; }
	.spec-item { color: #333; }
	.tag { color: #2e7d32; font-weight: 600; margin-right: 0.25rem; }

	/* ── 푸터 ── */
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 3rem;
		box-sizing: border-box;
		font-size: 0.8rem;
		color: #888;
		max-width: 1100px;
		margin: 2rem auto 0;
	}
	.footer-links {
		display: flex;
		gap: 1.25rem;
	}
	.footer-links button {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: #888;
		cursor: pointer;
	}
	.footer-links button:hover { color: #333; }

	/* ── 반응형 ── */
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
