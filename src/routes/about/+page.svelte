<script lang="ts">
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import RegionGlobe from '$lib/RegionGlobe.svelte';
	import WhyAnA from '$lib/WhyAnA.svelte';
	import Icon from '$lib/Icon.svelte';
	import { reveal } from '$lib/reveal.js';
	import { history } from '$lib/history.js';
	import { stack, tech } from '$lib/curriculum.js';

	const pillars = [
		{
			icon: 'app' as const,
			title: 'Application',
			body: '사용자를 위한 서비스를 만들고'
		},
		{
			icon: 'arch' as const,
			title: 'Architecture',
			body: '그 서비스의 구조를 설계합니다'
		}
	];

	/* ---------- history: side-scroll ---------- */
	let track: HTMLDivElement | undefined = $state();
	let atStart = $state(true);
	let atEnd = $state(false);

	function updateEnds() {
		if (!track) return;
		atStart = track.scrollLeft <= 2;
		atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
	}

	function step(dir: 1 | -1) {
		if (!track) return;
		const card = track.querySelector<HTMLElement>('.tl-item');
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		track.scrollBy({
			left: dir * (card?.offsetWidth ?? track.clientWidth),
			behavior: reduce ? 'auto' : 'smooth'
		});
	}

	$effect(() => {
		if (!track) return;
		updateEnds();
		const ro = new ResizeObserver(updateEnds);
		ro.observe(track);
		return () => ro.disconnect();
	});
</script>

<svelte:head>
	<title>About — AnA</title>
	<meta name="description" content="선린인터넷고등학교 소프트웨어과 전공동아리 AnA" />
</svelte:head>

<Nav />

<main>
	<div class="frame">
		<!-- ============ HERO + GLOBE ============ -->
		<section class="row bare hero">
			<h1>We're connecting the world</h1>
			<p>선린인터넷고등학교 서버/백엔드 전공동아리 AnA</p>
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
		<!-- <section class="row bare why-row">
			<WhyAnA />
		</section> -->

		<!-- ============ HISTORY (side-scroll timeline) ============ -->
		<section class="row timeline">
			<header class="tl-head reveal" use:reveal>
				<div class="tl-copy">
					<h2 class="title">연혁</h2>
				</div>
				<div class="tl-nav">
					<button
						type="button"
						class="tl-btn"
						aria-label="이전"
						disabled={atStart}
						onclick={() => step(-1)}
					>
						<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
							><path d="M10 3.5 5.5 8l4.5 4.5" /></svg
						>
					</button>
					<button
						type="button"
						class="tl-btn"
						aria-label="다음"
						disabled={atEnd}
						onclick={() => step(1)}
					>
						<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
							><path d="M6 3.5 10.5 8 6 12.5" /></svg
						>
					</button>
				</div>
			</header>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="tl-track"
				bind:this={track}
				onscroll={updateEnds}
				tabindex="0"
				role="region"
				aria-label="연혁 목록"
			>
				<ol class="tl-list">
					{#each history as h}
						<li class="tl-item" class:filled={!!h.title}>
							<span class="tl-node" aria-hidden="true"></span>
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
						</li>
					{/each}
				</ol>
			</div>
		</section>

		<!-- ============ STACK (asymmetric split) ============ -->
		<section class="row stack">
			<header class="stack-copy reveal" use:reveal>
				<h2 class="title">기술 스택</h2>
				<p class="subtitle">커리큘럼에서 다루는 기술들</p>
			</header>
			<ul class="stack-list">
				{#each stack as g}
					<li class="stack-row">
						<span class="spec-k">{g.area}</span>
						<span class="icons">
							{#each g.keys as key}
								<span class="tile" title={tech[key].label}>
									<img
										src={tech[key].src}
										alt={tech[key].label}
										width="26"
										height="26"
										loading="lazy"
									/>
								</span>
							{/each}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<!-- ============ CTA ============ -->
		<section class="row cta-row">
			<div class="cta">
				<div class="cta-glow" aria-hidden="true"></div>
				<h2>어두운 곳에서 세상을<br />밝게 만드는 동아리</h2>
				<p>모집 소식은 인스타그램 @sunrin_ana에서 확인할 수 있습니다.</p>
				<div class="cta-btns">
					<a
						class="btn btn-white btn-lg"
						href="https://instagram.com/sunrin_ana"
						target="_blank"
						rel="noopener">인스타그램</a
					>
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
		color: color-mix(in srgb, var(--ink) 70%, transparent);
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

	/* ---------- Cells ---------- */
	.cells {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
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

	/* ---------- Stack: left-aligned section copy ---------- */
	.stack-copy .subtitle {
		color: color-mix(in srgb, var(--ink) 68%, transparent);
	}

	/* ---------- History: side-scroll timeline ---------- */
	.timeline {
		padding: 96px 0 64px;
	}
	.tl-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		padding: 0 40px 48px;
	}
	.tl-copy {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.tl-nav {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}
	.tl-btn {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid var(--pill-border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			opacity 0.2s ease;
	}
	.tl-btn:hover:not(:disabled) {
		border-color: var(--line-2);
	}
	.tl-btn:focus-visible {
		border-radius: 999px;
	}
	.tl-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.tl-btn svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.tl-track {
		container-type: inline-size;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 40px;
		scrollbar-width: none;
	}
	.tl-track::-webkit-scrollbar {
		display: none;
	}
	.tl-track:focus-visible {
		outline-offset: -2px;
		border-radius: 0;
	}
	.tl-list {
		display: flex;
		width: max-content;
		min-width: 100%;
		list-style: none;
		margin: 0;
		/* aligns the first card with the frame's inner content edge */
		padding: 0 40px;
		--card-w: calc((100cqw - 80px) / 3.4);
	}
	.tl-item {
		position: relative;
		flex: 0 0 var(--card-w);
		min-height: 136px;
		padding: 30px 32px 4px 0;
		scroll-snap-align: start;
	}
	/* the hairline running through every card at node level */
	.tl-item::before {
		content: '';
		position: absolute;
		top: 4px;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--line);
	}
	.tl-item:last-child::before {
		right: 32px;
	}
	/* ring node — echoes the frame's rail markers */
	.tl-node {
		position: absolute;
		top: 0;
		left: 0;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--surface);
		box-shadow: inset 0 0 0 1px var(--line-2);
	}
	.tl-item.filled .tl-node {
		box-shadow: inset 0 0 0 1px var(--brand);
	}
	.tl-item h3 {
		margin: 0 0 8px;
		font-size: 1.1rem;
		font-weight: 500;
		letter-spacing: -0.015em;
	}
	.tl-item p {
		margin: 0;
		color: var(--ink-3);
		font-size: 0.94rem;
		line-height: 1.65;
	}
	.h-year {
		display: block;
		margin-bottom: 14px;
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

	/* ---------- Stack: asymmetric split ---------- */
	.stack {
		display: grid;
		grid-template-columns: 1fr 2fr;
	}
	.stack-copy {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 72px 40px;
	}
	.stack-list {
		display: flex;
		flex-direction: column;
		list-style: none;
		margin: 0;
		padding: 0;
		border-left: 1px solid var(--line);
	}
	.stack-row {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 20px 40px;
	}
	.stack-row + .stack-row {
		border-top: 1px solid var(--line);
	}
	.spec-k {
		width: 76px;
		flex-shrink: 0;
		font-size: 0.86rem;
		font-weight: 500;
		color: var(--ink-3);
	}
	.icons {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
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

	@media (prefers-reduced-motion: reduce) {
		.tl-track {
			scroll-behavior: auto;
		}
		.tile {
			transition: none;
		}
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
		color: var(--on-fill);
	}
	.cta-glow {
		position: absolute;
		z-index: -1;
		left: 50%;
		bottom: -55%;
		width: 90%;
		height: 90%;
		transform: translateX(-50%);
		background: radial-gradient(
			closest-side,
			rgba(255, 255, 255, 0.55),
			color-mix(in srgb, var(--accent-2) 45%, transparent) 45%,
			transparent
		);
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
		color: color-mix(in srgb, var(--on-fill) 82%, transparent);
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
		.cell {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
		.cell:first-child {
			border-top: 0;
		}
		.timeline {
			padding: 80px 0 56px;
		}
		.tl-head {
			padding: 0 24px 40px;
		}
		.tl-track {
			scroll-padding-inline: 24px;
		}
		.tl-list {
			padding: 0 24px;
			--card-w: calc((100cqw - 48px) / 2.4);
		}
		.stack {
			grid-template-columns: 1fr;
		}
		.stack-copy {
			padding: 64px 24px 32px;
		}
		.stack-list {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
		.stack-row {
			padding: 18px 24px;
		}
	}
	@media (max-width: 640px) {
		.hero {
			padding-top: 72px;
		}
		.cell {
			padding: 24px 20px 28px;
		}
		.timeline {
			padding: 64px 0 48px;
		}
		.tl-head {
			padding: 0 20px 32px;
		}
		.tl-nav {
			display: none;
		}
		.tl-track {
			scroll-padding-inline: 20px;
		}
		.tl-list {
			padding: 0 20px;
			--card-w: calc((100cqw - 40px) * 0.8);
		}
		.tl-item {
			padding-right: 24px;
		}
		.tl-item:last-child::before {
			right: 24px;
		}
		.stack-copy {
			padding: 56px 20px 28px;
		}
		.stack-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
			padding: 18px 20px;
		}
		.cta-row {
			padding: 8px;
		}
		.cta {
			padding: 80px 20px 88px;
		}
	}
</style>
