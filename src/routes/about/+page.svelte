<script lang="ts">
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import RegionGlobe from '$lib/RegionGlobe.svelte';
	import WhyAnA from '$lib/WhyAnA.svelte';
	import AnaFetch from '$lib/AnaFetch.svelte';
	import Terminal from '$lib/Terminal.svelte';
	import Icon from '$lib/Icon.svelte';
	import { reveal } from '$lib/reveal.js';
	import { history } from '$lib/history.js';
	import { stack, tech } from '$lib/curriculum.js';

	const pillars = [
		{
			icon: 'app' as const,
			title: 'Application',
			body: '웹과 앱을 기획부터 출시까지. 실제 사용자가 쓰는 프로덕트를 직접 만들고 배포합니다.'
		},
		{
			icon: 'arch' as const,
			title: 'Architecture',
			body: '서버, 데이터베이스, API. 서비스가 버티는 구조를 고민하고 설계합니다.'
		},
		{
			icon: 'infra' as const,
			title: 'Infrastructure',
			body: '컨테이너와 클라우드 위에서 서비스를 운영하며 실제 환경의 문제를 해결합니다.'
		}
	];



</script>

<svelte:head>
	<title>About — AnA</title>
	<meta name="description" content="2011년부터 활동해 온 선린인터넷고등학교 소프트웨어과 전공동아리 AnA를 소개합니다." />
</svelte:head>

<Nav />

<main>
	<div class="frame">
		<!-- ============ HERO + GLOBE ============ -->
		<section class="row bare hero">
			<h1>We're connecting the world.</h1>
			<p>화면을 그리는 일부터 서버를 설계하고 운영하는 일까지, 모두 직접 해봅니다.</p>
		</section>
		<section class="row bare globe-row">
			<div class="globe-bleed">
				<RegionGlobe />
			</div>
		</section>
		<section class="row cells">
			{#each pillars as p, i}
				<article class="cell reveal" use:reveal style="--d:{i * 0.06}s">
					<span class="cell-icon"><Icon name={p.icon} /></span>
					<h3>{p.title}</h3>
					<p>{p.body}</p>
				</article>
			{/each}
		</section>

		<!-- ============ WHY ANA ============ -->
		<section class="row bare why-row">
			<WhyAnA />
		</section>

		<!-- ============ HISTORY ============ -->
		<section class="row">
			<header class="section-head reveal" use:reveal>
				<h2 class="title">연혁</h2>
				<p class="subtitle">2011년부터 지금까지, AnA가 걸어온 길.</p>
			</header>
		</section>
		<section class="row cells history">
			{#each history as h, i}
				<article class="cell h-cell" class:empty={!h.title}>
					{#if h.year}
						<span class="h-year">{h.year}</span>
					{:else}
						<span class="ph ph-year" aria-hidden="true"></span>
					{/if}
					{#if h.title}
						<h3>{h.title}</h3>
						{#if h.body}<p>{h.body}</p>{/if}
					{:else}
						<span class="ph ph-title" aria-hidden="true"></span>
						<span class="ph ph-line" aria-hidden="true"></span>
						<span class="ph ph-line short" aria-hidden="true"></span>
					{/if}
				</article>
			{/each}
		</section>

		<!-- ============ STACK ============ -->
		<section class="row stack">
			<h2 class="col-title">기술 스택</h2>
			<ul class="log">
				{#each stack as g}
					<li class="stack-row">
						<span class="spec-k">{g.area}</span>
						<span class="icons">
							{#each g.keys as key}
								<span class="tile" title={tech[key].label}>
									<img src={tech[key].src} alt={tech[key].label} width="22" height="22" loading="lazy" />
								</span>
							{/each}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<!-- ============ TERMINAL ============ -->
		<section class="row">
			<header class="section-head reveal" use:reveal>
				<h2 class="title">AnA 터미널</h2>
				<p class="subtitle"><code>help</code>를 입력하면 사용할 수 있는 명령어를 볼 수 있습니다.</p>
			</header>
		</section>
		<section class="row shell">
			<div class="window">
				<div class="w-bar">
					<span class="lights"><i></i><i></i><i></i></span>
					<span>sunrin@ana: ~</span>
					<span></span>
				</div>
				<div class="w-body">
					<AnaFetch />
					<div class="term-host">
						<Terminal />
					</div>
				</div>
			</div>
		</section>

		<!-- ============ CTA ============ -->
		<section class="row cta-row">
			<div class="cta">
				<div class="cta-grain" aria-hidden="true"></div>
				<div class="cta-glow" aria-hidden="true"></div>
				<h2>어두운 곳에서 세상을<br />밝게 만드는 동아리</h2>
				<p>모집 소식은 인스타그램 @sunrin_ana에서 확인할 수 있습니다.</p>
				<div class="cta-btns">
					<a class="btn btn-white btn-lg" href="https://instagram.com/sunrin_ana" target="_blank" rel="noopener">인스타그램</a>
					<a class="btn btn-glass btn-lg" href="mailto:ana@sunrint.hs.kr">문의하기</a>
				</div>
			</div>
		</section>
	</div>
</main>

<Footer />

<style>
	main {
		padding-top: var(--nav-h);
	}

	/* ---------- Hero ---------- */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 112px 24px 0;
	}
	h1 {
		margin: 0;
		font-size: clamp(2.25rem, 4.2vw, 3rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.025em;
	}
	.hero > p {
		margin: 20px 0 0;
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		line-height: 1.6;
		color: rgba(28, 28, 31, 0.7);
	}
	.globe-row {
		margin-top: 40px;
	}
	.globe-bleed {
		position: relative;
		left: 50%;
		width: 100vw;
		margin-left: -50vw;
	}

	/* ---------- Why AnA (inside the frame) ---------- */
	.why-row :global(.grid) {
		border-left: 0;
		border-right: 0;
		border-bottom: 0;
	}

	/* ---------- Cells ---------- */
	.cells {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	.cell {
		padding: 28px 28px 36px;
		border-left: 1px solid var(--line);
	}
	.cell:first-child {
		border-left: 0;
	}
	.cell-icon {
		display: inline-grid;
		color: var(--ink);
		margin-bottom: 22px;
	}
	.cell h3 {
		margin: 0 0 8px;
		font-size: 1.1rem;
		font-weight: 500;
		letter-spacing: -0.015em;
	}
	.cell p {
		margin: 0;
		color: var(--ink-3);
		font-size: 0.94rem;
		line-height: 1.65;
	}

	/* ---------- Log + specs ---------- */
	.history {
		grid-template-columns: repeat(3, 1fr);
	}
	.h-cell {
		min-height: 168px;
	}
	.h-cell:nth-child(n + 4) {
		border-top: 1px solid var(--line);
	}
	.h-cell:nth-child(3n + 1) {
		border-left: 0;
	}
	.h-year {
		display: block;
		margin-bottom: 18px;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--brand);
		font-variant-numeric: tabular-nums;
	}
	.ph {
		display: block;
		border-radius: 4px;
		background: var(--surface-2);
	}
	.ph-year {
		width: 44px;
		height: 14px;
		margin: 4px 0 22px;
		background: color-mix(in srgb, var(--brand) 12%, transparent);
	}
	.ph-title {
		width: 58%;
		height: 18px;
		margin-bottom: 14px;
	}
	.ph-line {
		width: 88%;
		height: 11px;
		margin-bottom: 8px;
	}
	.ph-line.short {
		width: 46%;
	}
	.stack {
		padding: 56px 40px;
	}
	.col-title {
		margin: 0 0 20px;
		font-size: 1.15rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--ink);
	}
	.log li {
		display: flex;
		align-items: baseline;
		gap: 14px;
		padding: 14px 0;
		border-bottom: 1px solid var(--line);
	}
	.stack-row {
		align-items: center !important;
	}
	.icons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.tile {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.tile:hover {
		transform: translateY(-2px);
	}
	.tile img {
		width: 26px;
		height: 26px;
	}
	.spec-k {
		width: 88px;
		flex-shrink: 0;
		font-weight: 500;
		font-size: 0.95rem;
	}

	/* ---------- Terminal ---------- */
	code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		padding: 1px 6px;
		border-radius: 5px;
		background: var(--surface-2);
		color: var(--ink);
	}
	.shell {
		padding: 0 40px 56px;
	}
	.shell::before,
	.shell::after {
		display: none;
	}
	.window {
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #fff;
		overflow: hidden;
	}
	.w-bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: 38px;
		padding: 0 14px;
		border-bottom: 1px solid var(--line);
		background: var(--surface-3);
		font-size: 12px;
		color: var(--ink-3);
	}
	.lights {
		display: flex;
		gap: 7px;
	}
	.lights i {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: #e2e2e7;
	}
	.w-body {
		padding: 24px 28px 28px;
		font-size: 13px;
		line-height: 1.3;
		max-height: 720px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.w-body :global(pre) {
		overflow-x: auto;
	}
	.term-host {
		margin-top: 24px;
	}
	.term-host :global(#term-scroll) {
		opacity: 1 !important;
	}
	.term-host :global(.term-typed) {
		white-space: pre-wrap;
		word-break: break-all;
	}

	/* ---------- CTA ---------- */
	.cta-row {
		padding: 12px;
	}
	.cta {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 112px 24px 124px;
		border-radius: var(--radius-lg);
		color: #fff;
		background: linear-gradient(180deg, #2f50e0, #1f3cc0);
	}
	.cta-grain {
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image: radial-gradient(rgba(255, 255, 255, 0.16) 0.8px, transparent 1.1px);
		background-size: 6px 6px;
		mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.3), #000 85%);
		-webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.3), #000 85%);
	}
	.cta-glow {
		position: absolute;
		z-index: -1;
		left: 50%;
		bottom: -55%;
		width: 90%;
		height: 90%;
		transform: translateX(-50%);
		background: radial-gradient(closest-side, rgba(255, 255, 255, 0.55), rgba(140, 170, 255, 0.35) 45%, transparent);
		filter: blur(8px);
	}
	.cta h2 {
		margin: 0;
		font-size: clamp(2rem, 4.4vw, 3.2rem);
		font-weight: 500;
		line-height: 1.2;
		letter-spacing: -0.025em;
	}
	.cta p {
		margin: 18px 0 0;
		color: rgba(255, 255, 255, 0.82);
	}
	.cta-btns {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 32px;
	}

	/* ---------- Responsive ---------- */
	@media (max-width: 960px) {
		.cells {
			grid-template-columns: 1fr;
		}
		.history {
			grid-template-columns: 1fr 1fr;
		}
		.h-cell:nth-child(n) {
			border-left: 1px solid var(--line);
			border-top: 1px solid var(--line);
		}
		.h-cell:nth-child(odd) {
			border-left: 0;
		}
		.h-cell:nth-child(-n + 2) {
			border-top: 0;
		}
		.cell {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
		.cell:first-child {
			border-top: 0;
		}
		.stack {
			padding: 48px 24px;
		}
		.shell {
			padding: 0 24px 48px;
		}
	}
	@media (max-width: 640px) {
		.hero {
			padding-top: 72px;
		}
		.cell {
			padding: 24px 20px 28px;
		}
		.stack {
			padding: 40px 20px;
		}
		.history {
			grid-template-columns: 1fr;
		}
		.h-cell:nth-child(n) {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
		.h-cell:first-child {
			border-top: 0;
		}
		.shell {
			padding: 0 12px 40px;
		}
		.w-body {
			padding: 16px;
			font-size: 11px;
		}
		.cta-row {
			padding: 8px;
		}
		.cta {
			padding: 80px 20px 88px;
		}
	}
</style>
