<script lang="ts">
	// Project detail page — Apple / OpenAI product-page structure:
	// icon + name hero → devices on a stage → overview + facts → highlights (zigzag) → more projects.
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import Laptop from '$lib/devices/Laptop.svelte';
	import Phone from '$lib/devices/Phone.svelte';
	import Browser from '$lib/devices/Browser.svelte';
	import Screen from '$lib/devices/Screen.svelte';
	import { reveal } from '$lib/reveal.js';
	import { categoryLabels } from '$lib/archives.js';

	let { data } = $props();
	const item = $derived(data.item);
	const host = $derived(item.url ? new URL(item.url).host : item.name);
	const repoLabel = $derived.by(() => {
		if (!item.repo) return '';
		const u = new URL(item.repo);
		return (u.host + u.pathname).replace(/\/$/, '');
	});
	const internal = $derived(item.category === 'internal');
	const paragraphs = $derived(item.overview?.length ? item.overview : [item.description]);
	// Without its own overview the page has one sentence of copy, so the facts run as a strip under it.
	const strip = $derived(!item.overview?.length);
	// Devices: the phone only appears with a real mobile screenshot; a splash-only stage is lighter.
	const showPhone = $derived(!!item.screens?.mobile);
	const showLaptop = $derived(!!item.screens?.desktop || !showPhone);
	const splashOnly = $derived(!item.screens?.desktop && !item.screens?.mobile);
	const others = $derived(
		[data.prev, data.next].filter(
			(o, i, arr) => o && o.id !== item.id && arr.findIndex((x) => x?.id === o.id) === i
		)
	);

	const LOGO =
		'M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z';
</script>

<svelte:head>
	<title>{item.name} — Archives — AnA</title>
	<meta name="description" content="{item.tagline} {item.description}" />
</svelte:head>

{#snippet appIcon(it: typeof item, size: string)}
	<span
		class="app-icon"
		style="--from:{it.theme[0]}; --to:{it.theme[1]}; --s:{size}"
		aria-hidden="true"
	>
		{#if it.category === 'internal'}
			<svg viewBox="0 0 52 52"
				><path fill-rule="evenodd" clip-rule="evenodd" d={LOGO} fill="#fff" /></svg
			>
		{:else}
			<span class="initial">{it.name.slice(0, 1)}</span>
		{/if}
	</span>
{/snippet}

{#snippet shot(src?: string, srcDark?: string, alt = '', eager = false)}
	<Screen {src} {srcDark} {alt} name={item.name} theme={item.theme} mark={internal} {eager} />
{/snippet}

<Nav />

<main>
	<div class="frame">
		<!-- ============ HERO ============ -->
		<section class="row bare crumb">
			<a href="/archives" class="back">
				<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
				Archives
			</a>
		</section>

		<section class="row bare hero">
			{@render appIcon(item, '88px')}
			<h1>{item.name}</h1>
			<p class="tagline">{item.tagline}</p>
			{#if item.url || item.repo}
				<div class="actions">
					{#if item.url}
						<a class="btn btn-brand btn-lg" href={item.url} target="_blank" rel="noopener"
							>방문하기</a
						>
					{/if}
					{#if item.repo}
						<a class="btn btn-line btn-lg" href={item.repo} target="_blank" rel="noopener"
							>소스 코드</a
						>
					{/if}
				</div>
			{/if}
		</section>

		<!-- ============ DEVICES ============ -->
		<section class="row bare stage" class:splash-only={splashOnly}>
			<div class="devices" class:pair={showLaptop && showPhone}>
				{#if showLaptop}
					<div class="laptop-wrap">
						<Laptop>
							{@render shot(
								item.screens?.desktop,
								item.screens?.desktopDark,
								`${item.name} 데스크톱 화면`,
								true
							)}
						</Laptop>
					</div>
				{/if}
				{#if showPhone}
					<div class="phone-wrap">
						<Phone>
							{@render shot(
								item.screens?.mobile,
								item.screens?.mobileDark,
								`${item.name} 모바일 화면`,
								true
							)}
						</Phone>
					</div>
				{/if}
			</div>
		</section>

		<!-- ============ OVERVIEW ============ -->
		<section class="row overview" class:strip>
			<div class="ov-text reveal" use:reveal>
				{#each paragraphs as para, i}
					<p class:lead={i === 0}>{para}</p>
				{/each}
			</div>
			<dl class="facts reveal" use:reveal style="--d:0.08s">
				<div>
					<dt>카테고리</dt>
					<dd>{categoryLabels[item.category]}</dd>
				</div>
				<div>
					<dt>개발 연도</dt>
					<dd>{item.year}</dd>
				</div>
				<div>
					<dt>by</dt>
					<dd>{item.makers.join(', ')}</dd>
				</div>
				{#if item.stack.length}
					<div>
						<dt>기술</dt>
						<dd class="chips">
							{#each item.stack as s}<span>{s}</span>{/each}
						</dd>
					</div>
				{/if}
				{#if item.url}
					<div>
						<dt>주소</dt>
						<dd>
							<a class="text-link" href={item.url} target="_blank" rel="noopener">{host} ↗</a>
						</dd>
					</div>
				{/if}
				{#if item.repo}
					<div>
						<dt>소스 코드</dt>
						<dd>
							<a class="text-link" href={item.repo} target="_blank" rel="noopener">{repoLabel} ↗</a>
						</dd>
					</div>
				{/if}
			</dl>
		</section>

		<!-- ============ HIGHLIGHTS ============ -->
		{#each item.highlights ?? [] as h, i}
			<section class="row hl" class:flip={i % 2 === 1}>
				<div class="hl-text reveal" use:reveal>
					<h2>{h.title}</h2>
					<p>{h.body}</p>
				</div>
				<div
					class="hl-media reveal"
					class:mobile={h.device === 'mobile'}
					use:reveal
					style="--d:0.08s"
				>
					{#if h.device === 'mobile'}
						<div class="hl-phone">
							<Phone>
								{@render shot(h.image, h.imageDark, h.alt)}
							</Phone>
						</div>
					{:else}
						<Browser url={host}>
							{@render shot(h.image, h.imageDark, h.alt)}
						</Browser>
					{/if}
				</div>
			</section>
		{/each}

		<!-- ============ MORE ============ -->
		{#if others.length}
			<section class="row more-head">
				<h2>다른 프로젝트</h2>
				<a class="text-link" href="/archives">전체 보기 →</a>
			</section>
			<section class="row more" class:single={others.length === 1}>
				{#each others as o}
					{#if o}
						<a class="more-card" href="/archives/{o.id}">
							{@render appIcon(o, '52px')}
							<span class="more-copy">
								<span class="more-name">{o.name}</span>
								<span class="more-tag">{o.tagline}</span>
							</span>
							<svg class="more-arrow" viewBox="0 0 16 16" aria-hidden="true"
								><path d="M6 3l5 5-5 5" /></svg
							>
						</a>
					{/if}
				{/each}
			</section>
		{/if}
	</div>
</main>

<Footer />

<style>
	main {
		padding-top: var(--nav-h);
	}
	/* content inset from the frame rail — matches the /archives list (56px) */
	.frame {
		--inset: 56px;
	}

	/* ---------- app icon ---------- */
	.app-icon {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: var(--s);
		aspect-ratio: 1;
		border-radius: 23%;
		background: linear-gradient(160deg, var(--from), var(--to));
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -10px 20px rgba(0, 0, 0, 0.12),
			0 16px 30px -18px color-mix(in srgb, var(--to) 80%, transparent);
	}
	.app-icon svg {
		width: 46%;
	}
	.initial {
		color: #fff;
		font-size: calc(var(--s) * 0.42);
		font-weight: 500;
		line-height: 1;
	}

	/* ---------- crumb + hero ---------- */
	.crumb {
		padding: 28px var(--inset) 0;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.92rem;
		font-weight: 500;
		color: var(--ink-3);
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.back:hover {
		color: var(--ink);
	}
	.back svg,
	.more-arrow {
		width: 14px;
		height: 14px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 56px 24px 0;
	}
	h1 {
		margin: 28px 0 0;
		font-size: clamp(2.75rem, 6vw, 4.5rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.035em;
	}
	.tagline {
		margin: 18px 0 0;
		font-size: clamp(1.1rem, 1.6vw, 1.35rem);
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 28px;
	}

	/* ---------- device stage ---------- */
	/* overflow: clip (not hidden) so .stage is not a scroll container and view() follows the page */
	.stage {
		padding: 64px var(--inset) 88px;
		overflow: clip;
	}
	.stage.splash-only {
		padding: 56px var(--inset) 72px;
	}
	.devices {
		position: relative;
		max-width: 980px;
		margin: 0 auto;
	}
	.splash-only .devices {
		max-width: 720px;
	}
	.devices:not(.pair) .phone-wrap {
		width: min(280px, 60%);
		margin: 0 auto;
	}
	.pair .phone-wrap {
		position: absolute;
		right: 0;
		bottom: -6%;
		width: 19%;
	}
	/* The laptop is the hero product and sits above the fold, so it is never faded.
	   Only the phone rises into place as the stage scrolls up; its range ends before the
	   stage is halfway up the viewport. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.phone-wrap {
				animation: rise-phone linear both;
				animation-timeline: view();
				animation-range: entry 0% cover 45%;
			}
		}
	}
	@keyframes rise-phone {
		from {
			translate: 0 12%;
		}
		to {
			translate: 0 0;
		}
	}

	/* ---------- overview ---------- */
	.overview {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}
	.ov-text {
		padding: 64px 56px 72px var(--inset);
	}
	.ov-text p {
		margin: 18px 0 0;
		font-size: 1.05rem;
		line-height: 1.75;
		color: var(--ink-2);
	}
	.ov-text p.lead {
		/* trims the lead's extra half-leading so its first line meets the first fact row */
		margin: -0.2em 0 0;
		font-size: clamp(1.35rem, 2.1vw, 1.7rem);
		line-height: 1.5;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.facts {
		margin: 0;
		padding: 64px var(--inset) 64px 40px;
		border-left: 1px solid var(--line);
	}
	.facts > div {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 12px;
		padding: 14px 0;
		border-bottom: 1px solid var(--line);
		font-size: 0.95rem;
	}
	.facts > div:first-child {
		padding-top: 0;
	}
	.facts > div:last-child {
		border-bottom: 0;
	}
	dt {
		color: var(--ink-3);
	}
	dd {
		margin: 0;
		color: var(--ink);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chips span {
		padding: 1px 9px;
		border: 1px solid var(--pill-border);
		border-radius: var(--pill);
		font-size: 0.82rem;
		color: var(--ink-2);
	}

	/* overview without its own paragraphs: one lead line, then the facts as a strip of cells */
	.overview.strip {
		grid-template-columns: 1fr;
	}
	.strip .ov-text {
		padding: 64px var(--inset) 56px;
	}
	.strip .ov-text p.lead {
		max-width: 36ch;
	}
	.strip .facts {
		display: flex;
		padding: 0;
		border-left: 0;
		border-top: 1px solid var(--line);
	}
	.strip .facts > div {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 24px 24px 28px;
		border-bottom: 0;
		border-left: 1px solid var(--line);
	}
	.strip .facts > div:first-child {
		padding-left: var(--inset);
		border-left: 0;
	}

	/* ---------- highlights (zigzag) ---------- */
	/* the media always takes the wide 7fr track; flipped rows mirror the tracks */
	.hl {
		display: grid;
		grid-template-columns: 5fr 7fr;
		grid-template-areas: 'text media';
		align-items: center;
		gap: 56px;
		padding: 88px var(--inset);
	}
	.hl.flip {
		grid-template-columns: 7fr 5fr;
		grid-template-areas: 'media text';
	}
	.hl-text {
		grid-area: text;
	}
	.hl-media {
		grid-area: media;
	}
	.hl h2 {
		margin: 0;
		font-size: clamp(1.6rem, 2.6vw, 2.1rem);
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: -0.025em;
	}
	.hl p {
		margin: 16px 0 0;
		max-width: 34ch;
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--ink-2);
	}
	.hl-media.mobile {
		display: grid;
		place-items: center;
		padding: 48px 0;
		border-radius: var(--radius-lg);
		background: var(--surface-2);
	}
	.hl-phone {
		width: min(260px, 52%);
	}

	/* ---------- more projects ---------- */
	.more-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding: 56px var(--inset) 24px;
	}
	.more-head h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.more {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.more.single {
		grid-template-columns: 1fr;
	}
	.more-card {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 28px var(--inset);
		color: inherit;
		text-decoration: none;
		transition: background 0.2s ease;
	}
	.more-card + .more-card {
		border-left: 1px solid var(--line);
	}
	.more-card:hover {
		background: var(--surface-2);
	}
	.more-copy {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.more-name {
		font-size: 1.1rem;
		font-weight: 500;
	}
	.more-tag {
		font-size: 0.92rem;
		color: var(--ink-3);
	}
	.more-arrow {
		margin-left: auto;
		flex-shrink: 0;
		color: var(--ink-4);
		transition:
			transform 0.25s var(--ease-out),
			color 0.2s ease;
	}
	.more-card:hover .more-arrow {
		transform: translateX(3px);
		color: var(--ink);
	}

	/* ---------- responsive ---------- */
	@media (max-width: 960px) {
		.frame {
			--inset: 32px;
		}
		.overview {
			grid-template-columns: 1fr;
		}
		.facts {
			border-left: 0;
			border-top: 1px solid var(--line);
			padding: 40px var(--inset) 64px;
		}
		.strip .facts {
			padding: 0;
		}
		.hl,
		.hl.flip {
			grid-template-columns: 1fr;
			grid-template-areas: 'text' 'media';
			gap: 36px;
			padding: 64px var(--inset);
		}
	}
	@media (max-width: 640px) {
		.frame {
			--inset: 20px;
		}
		.crumb {
			padding-top: 20px;
		}
		.hero {
			padding: 40px 20px 0;
		}
		.stage,
		.stage.splash-only {
			padding: 44px var(--inset) 56px;
		}
		/* on a phone the composite would shrink both screens to thumbnails:
		   show the phone on its own at a readable size instead */
		.pair .laptop-wrap {
			display: none;
		}
		.pair .phone-wrap {
			position: relative;
			right: auto;
			bottom: auto;
			width: min(260px, 64%);
			margin: 0 auto;
		}
		.ov-text {
			padding: 48px var(--inset) 40px;
		}
		.facts {
			padding: 32px var(--inset) 40px;
		}
		/* strip → stacked rows */
		.strip .ov-text {
			padding: 48px var(--inset) 40px;
		}
		.strip .facts {
			display: block;
			padding: 8px var(--inset) 24px;
		}
		.strip .facts > div,
		.strip .facts > div:first-child {
			display: grid;
			grid-template-columns: 80px 1fr;
			gap: 12px;
			padding: 14px 0;
			border-left: 0;
			border-bottom: 1px solid var(--line);
		}
		.strip .facts > div:last-child {
			border-bottom: 0;
		}
		.hl,
		.hl.flip {
			padding: 56px var(--inset);
		}
		.hl-media.mobile {
			padding: 32px 0;
		}
		.more-head {
			padding: 44px var(--inset) 20px;
		}
		.more {
			grid-template-columns: 1fr;
		}
		.more-card {
			padding: 22px var(--inset);
		}
		.more-card + .more-card {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
	}
</style>
