<script lang="ts">
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import { reveal } from '$lib/reveal.js';
	import { tracks, tech } from '$lib/curriculum.js';

	const num = (i: number) => String(i + 1).padStart(2, '0');
</script>

<svelte:head>
	<title>Curriculum — AnA</title>
	<meta name="description" content="AnA 부원들이 함께 공부하는 커리큘럼 트랙과 모듈을 소개합니다." />
</svelte:head>

<Nav />

<main>
	<div class="frame">
		<!-- ============ HERO ============ -->
		<section class="row bare hero">
			<div class="hero-text">
				<h1>Curriculum</h1>
				<p>AnA 부원들이 함께 공부하는 과정입니다.</p>
			</div>
			<nav class="jump" aria-label="트랙 바로가기">
				{#each tracks as t, i}
					<a class="jump-pill" href="#{t.id}">
						<span class="jump-n">Track {num(i)}</span>
						{t.title.replace(' Track', '')}
						<span class="jump-count">{t.modules.length}</span>
					</a>
				{/each}
			</nav>
		</section>

		<!-- ============ OVERVIEW ============ -->
		<section class="row overview" aria-label="트랙 목차">
			{#each tracks as t, i}
				<a class="ov" href="#{t.id}">
					<span class="ov-head">
						<span class="ov-n">Track {num(i)}</span>
						<span class="ov-title">{t.title}</span>
					</span>
					<ol class="ov-list">
						{#each t.modules as m}
							<li><span>{m.id}</span>{m.name}</li>
						{/each}
					</ol>
				</a>
			{/each}
		</section>

		<!-- ============ TRACKS ============ -->
		{#each tracks as t, i}
			<section class="row track" id={t.id} aria-labelledby="{t.id}-title">
				<header class="track-head">
					<div class="track-sticky reveal" use:reveal>
						<span class="kicker">Track {num(i)}</span>
						<h2 id="{t.id}-title">{t.title}</h2>
						<p>{t.summary}</p>
						<span class="track-count">모듈 {t.modules.length}개</span>
					</div>
				</header>
				<ol class="road">
					{#each t.modules as m, k}
						<li class="step reveal" use:reveal style="--d:{k * 0.07}s">
							<span class="node" aria-hidden="true">{m.id}</span>
							<div class="step-body">
								<h3>{m.name}</h3>
								{#if m.tech.length}
									<ul class="stack" aria-label="다루는 기술">
										{#each m.tech as key}
											<li>
												<img src={tech[key].src} alt="" width="16" height="16" loading="lazy" />
												{tech[key].label}
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			</section>
		{/each}

		<!-- ============ NOTE ============ -->
		<section class="row note">
			<p>커리큘럼은 기수마다 부원들과 함께 다듬어 갑니다.</p>
			<a class="btn btn-line" href="/about">AnA 알아보기</a>
		</section>
	</div>
</main>

<Footer />

<style>
	main {
		padding-top: var(--nav-h);
	}

	/* ---------- Hero (F-pattern: left-aligned, pills bottom-right) ---------- */
	.hero {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: 32px 40px;
		padding: 112px 40px 72px;
	}
	/* never shrinks below its one-line width: the pills wrap underneath first */
	.hero-text {
		flex: 1 0 auto;
	}
	h1 {
		margin: 0;
		font-size: clamp(2.25rem, 4.2vw, 3rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.025em;
	}
	.hero-text p {
		margin: 20px 0 0;
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		color: color-mix(in srgb, var(--ink) 70%, transparent);
	}
	.jump {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.jump-pill {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		height: 40px;
		padding: 0 8px 0 16px;
		border: 1px solid var(--pill-border);
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		transition: border-color 0.2s ease;
	}
	.jump-pill:hover {
		border-color: var(--line-2);
	}
	.jump-pill:focus-visible {
		border-radius: 999px;
	}
	.jump-n {
		color: var(--brand);
	}
	.jump-count {
		display: inline-grid;
		place-items: center;
		min-width: 24px;
		height: 24px;
		padding: 0 6px;
		border-radius: 999px;
		background: var(--surface-2);
		font-size: 0.8rem;
		color: var(--ink-2);
	}

	/* ---------- Overview (split) ---------- */
	.overview {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.ov {
		display: flex;
		flex-direction: column;
		padding: 32px 40px 36px;
		text-decoration: none;
		color: inherit;
		transition: background 0.2s ease;
	}
	.ov + .ov {
		border-left: 1px solid var(--line);
	}
	.ov:hover {
		background: var(--surface-3);
	}
	.ov:focus-visible {
		border-radius: 0;
		outline-offset: -2px;
	}
	.ov-n,
	.kicker {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--brand);
	}
	/* compact index: kicker + title on one line, the module list is the content */
	.ov-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 14px;
	}
	.ov-title {
		font-size: 1.15rem;
		font-weight: 500;
		letter-spacing: -0.015em;
	}
	.ov-list {
		list-style: none;
		margin: 20px 0 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	.ov-list li {
		display: flex;
		gap: 14px;
		padding: 11px 0;
		border-bottom: 1px solid var(--line);
		font-size: 0.95rem;
	}
	.ov-list span {
		color: var(--ink-4);
		font-variant-numeric: tabular-nums;
	}

	/* ---------- Track (asymmetric: sticky head + roadmap) ---------- */
	.track {
		display: grid;
		grid-template-columns: 11fr 13fr;
		scroll-margin-top: var(--nav-h);
	}
	.track-head {
		border-right: 1px solid var(--line);
		padding: 64px 40px;
	}
	.track-sticky {
		position: sticky;
		top: calc(var(--nav-h) + 32px);
	}
	.kicker {
		display: block;
	}
	.track-head h2 {
		margin: 14px 0 0;
		font-size: clamp(1.5rem, 2.3vw, 2rem);
		font-weight: 500;
		line-height: 1.15;
		letter-spacing: -0.025em;
	}
	.track-head p {
		margin: 16px 0 0;
		line-height: 1.6;
		color: color-mix(in srgb, var(--ink) 70%, transparent);
	}
	.track-count {
		display: block;
		margin-top: 24px;
		font-size: 0.9rem;
		color: var(--ink-3);
	}

	/* roadmap */
	.road {
		--node: 34px;
		list-style: none;
		margin: 0;
		padding: 64px 40px 64px 48px;
	}
	.step {
		position: relative;
		display: grid;
		grid-template-columns: var(--node) 1fr;
		column-gap: 24px;
		padding-bottom: 44px;
	}
	.step:last-child {
		padding-bottom: 0;
	}
	/* connector line: from this node's centre to the next node */
	.step:not(:last-child)::before {
		content: '';
		position: absolute;
		left: calc(var(--node) / 2 - 0.5px);
		top: calc(var(--node) / 2);
		bottom: calc(var(--node) / -2);
		width: 1px;
		background: var(--line-2);
	}
	.node {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: var(--node);
		height: var(--node);
		border: 1px solid var(--line-2);
		border-radius: 50%;
		background: var(--surface);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
		transition:
			border-color 0.2s ease,
			color 0.2s ease,
			background-color 0.2s ease;
	}
	.step:first-child .node,
	.step:hover .node {
		border-color: var(--brand-line);
		background: var(--brand-soft);
		color: var(--brand);
	}
	.step-body {
		min-width: 0;
		padding-top: calc((var(--node) - 1.2rem * 1.35) / 2);
	}
	.step h3 {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 500;
		line-height: 1.35;
		letter-spacing: -0.015em;
	}
	.stack {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 14px 0 0;
		padding: 0;
	}
	.stack li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 30px;
		padding: 0 10px;
		border: 1px solid var(--pill-border);
		border-radius: 999px;
		font-size: 0.85rem;
		color: var(--ink-2);
	}
	.stack img {
		width: 16px;
		height: 16px;
	}

	/* ---------- Note ---------- */
	.note {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding: 40px;
	}
	.note p {
		margin: 0;
		color: var(--ink-2);
	}

	@media (prefers-reduced-motion: reduce) {
		.node {
			transition: none;
		}
	}

	/* ---------- Responsive ---------- */
	@media (max-width: 960px) {
		/* the hero pills already index the tracks and every module follows
		   right below, so the overview would only repeat itself here */
		.overview {
			display: none;
		}
		.track {
			grid-template-columns: 1fr;
		}
		.track-head {
			border-right: 0;
			padding: 56px 40px 0;
		}
		.track-sticky {
			position: static;
		}
		.road {
			padding: 40px 40px 56px;
		}
	}
	@media (max-width: 640px) {
		.hero {
			padding: 72px 20px 48px;
		}
		.ov {
			padding: 32px 20px;
		}
		.track-head {
			padding: 48px 20px 0;
		}
		.track-head h2 {
			font-size: 1.6rem;
		}
		.road {
			--node: 30px;
			padding: 32px 20px 48px;
		}
		.step {
			column-gap: 16px;
			padding-bottom: 36px;
		}
		.step h3 {
			font-size: 1.1rem;
		}
		.note {
			padding: 32px 20px;
		}
	}
</style>
