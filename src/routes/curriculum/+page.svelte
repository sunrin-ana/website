<script lang="ts">
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import { reveal } from '$lib/reveal.js';
	import { tracks, tech } from '$lib/curriculum.js';

	// pad each track's module grid to full rows of 3 so the hairlines stay tidy
	const filler = (n: number) => (3 - (n % 3)) % 3;
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
			<h1>Curriculum</h1>
			<p>AnA 부원들이 함께 공부하는 과정입니다.</p>
			<nav class="jump" aria-label="트랙 바로가기">
				{#each tracks as t, i}
					<a class="jump-pill" href="#{t.id}">
						<span class="jump-n">Track {String(i + 1).padStart(2, '0')}</span>
						{t.title.replace(' Track', '')}
						<span class="jump-count">{t.modules.length}</span>
					</a>
				{/each}
			</nav>
		</section>

		<!-- ============ OVERVIEW ============ -->
		<section class="row overview">
			{#each tracks as t, i}
				<a class="ov" href="#{t.id}">
					<span class="ov-n">Track {String(i + 1).padStart(2, '0')}</span>
					<h2>{t.title}</h2>
					<p>{t.summary}</p>
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
			<section class="row" id={t.id}>
				<header class="section-head reveal" use:reveal>
					<span class="kicker">Track {String(i + 1).padStart(2, '0')}</span>
					<h2 class="title">{t.title}</h2>
					<p class="subtitle">{t.summary}</p>
				</header>
			</section>
			<section class="row modules">
				{#each t.modules as m, k}
					<article class="mod reveal" use:reveal style="--d:{(k % 3) * 0.06}s">
						<div class="mod-top">
							<span class="mod-n">{m.id}</span>
							{#if k < t.modules.length - 1}<span class="mod-next" aria-hidden="true">→</span>{/if}
						</div>
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
					</article>
				{/each}
				{#each Array(filler(t.modules.length)) as _}
					<div class="mod mod-empty" aria-hidden="true"></div>
				{/each}
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

	/* ---------- Hero ---------- */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 112px 24px 72px;
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
		color: rgba(28, 28, 31, 0.7);
	}
	.jump {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 32px;
	}
	.jump-pill {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		height: 40px;
		padding: 0 8px 0 16px;
		border: 1px solid #f0f0f0;
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

	/* ---------- Overview ---------- */
	.overview {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.ov {
		display: flex;
		flex-direction: column;
		padding: 40px;
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
	.ov-n,
	.kicker {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--brand);
	}
	.ov h2 {
		margin: 14px 0 8px;
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.ov > p {
		margin: 0;
		color: var(--ink-3);
		line-height: 1.6;
	}
	.ov-list {
		list-style: none;
		margin: 28px 0 0;
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

	/* ---------- Track section ---------- */
	.kicker {
		display: block;
	}

	/* ---------- Modules ---------- */
	.modules {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	.mod {
		display: flex;
		flex-direction: column;
		min-height: 200px;
		padding: 28px 28px 32px;
		border-left: 1px solid var(--line);
	}
	.mod:nth-child(3n + 1) {
		border-left: 0;
	}
	.mod:nth-child(n + 4) {
		border-top: 1px solid var(--line);
	}
	.mod-empty {
		background-image: radial-gradient(var(--gutter-dot) 0.7px, transparent 0.9px);
		background-size: 6px 6px;
	}
	.mod-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.mod-n {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--brand);
		font-variant-numeric: tabular-nums;
	}
	.mod-next {
		color: var(--ink-4);
	}
	.mod h3 {
		margin: 40px 0 0;
		font-size: 1.2rem;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.015em;
	}
	.stack {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: auto 0 0;
		padding: 20px 0 0;
	}
	.stack li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 30px;
		padding: 0 10px;
		border: 1px solid #f0f0f0;
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

	/* ---------- Responsive ---------- */
	@media (max-width: 960px) {
		.overview {
			grid-template-columns: 1fr;
		}
		.ov + .ov {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
		.modules {
			grid-template-columns: 1fr 1fr;
		}
		.mod:nth-child(n) {
			border-left: 1px solid var(--line);
			border-top: 1px solid var(--line);
		}
		.mod:nth-child(odd) {
			border-left: 0;
		}
		.mod:nth-child(-n + 2) {
			border-top: 0;
		}
		.mod-empty {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.hero {
			padding: 72px 20px 48px;
		}
		.ov {
			padding: 32px 20px;
		}
		.modules {
			grid-template-columns: 1fr;
		}
		.mod:nth-child(n) {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
		.mod:first-child {
			border-top: 0;
		}
		.mod {
			min-height: 0;
			padding: 24px 20px 28px;
		}
		.mod h3 {
			margin-top: 20px;
		}
		.note {
			padding: 32px 20px;
		}
	}
</style>
