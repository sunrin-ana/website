<script lang="ts">
	import { tick } from 'svelte';
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import { reveal } from '$lib/reveal.js';
	import { archives, categoryLabels, statusLabels } from '$lib/archives.js';

	type Filter = 'all' | 'member' | 'internal';
	const filters: Filter[] = ['all', 'member', 'internal'];

	let active = $state<Filter>('all');
	let query = $state('');

	const featured = archives.filter((a) => a.featured);
	const counts = {
		all: archives.length,
		member: archives.filter((a) => a.category === 'member').length,
		internal: archives.filter((a) => a.category === 'internal').length
	};

	async function showInList(e: MouseEvent, id: string) {
		e.preventDefault();
		active = 'all';
		query = '';
		await tick();
		document.getElementById(`list-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		history.replaceState(null, '', `#list-${id}`);
	}

	let list = $derived(
		archives
			.filter((a) => active === 'all' || a.category === active)
			.filter((a) => {
				const q = query.trim().toLowerCase();
				if (!q) return true;
				return [a.name, a.tagline, a.description, ...a.stack, ...a.makers]
					.join(' ')
					.toLowerCase()
					.includes(q);
			})
			.sort((a, b) => b.year - a.year)
	);
</script>

<svelte:head>
	<title>Archives — AnA</title>
	<meta name="description" content="AnA 부원들이 개발한 서비스와 동아리 내부 서비스를 소개합니다." />
</svelte:head>

<Nav />

<main>
	<div class="frame">
		<!-- ============ INTRO ============ -->
		<header class="row no-cross intro">
			<h1>Archives</h1>
			<p class="lede">AnA 부원들이 만든 서비스와 동아리에서 운영하는 서비스를 모았습니다.</p>
		</header>

		<!-- ============ FEATURED (Apple tiles) ============ -->
		{#if featured.length}
			<section class="row featured">
				{#each featured as item, i}
					<article class="tile reveal" use:reveal id={item.id} style="--from:{item.theme[0]}; --to:{item.theme[1]}; --d:{i * 0.06}s">
						<span class="tile-status"><i></i>{statusLabels[item.status]}</span>
						<h2>{item.name}</h2>
						<p>{item.tagline}</p>
						<div class="tile-links">
							{#if item.url}
								<a class="btn btn-brand btn-sm" href={item.url} target="_blank" rel="noopener">방문하기</a>
							{/if}
							<a class="text-link" href="#list-{item.id}" onclick={(e) => showInList(e, item.id)}>자세히 보기 →</a>
						</div>
						<div class="app-icon" aria-hidden="true"><svg viewBox="0 0 52 52"><path fill-rule="evenodd" clip-rule="evenodd" d="M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z" fill="#fff"/></svg></div>
					</article>
				{/each}
			</section>
		{/if}

		<!-- ============ LIST (OpenAI) ============ -->
		<section class="row browse">
			<div class="toolbar">
				<div class="filters" role="tablist" aria-label="카테고리">
					{#each filters as f}
						<button
							role="tab"
							aria-selected={active === f}
							class="chip"
							class:active={active === f}
							onclick={() => (active = f)}
						>
							{categoryLabels[f]}<span class="count">{counts[f]}</span>
						</button>
					{/each}
				</div>
				<label class="search">
					<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" /><path d="M14 14l4 4" /></svg>
					<input type="search" placeholder="서비스, 기술, 만든 사람 검색" bind:value={query} />
				</label>
			</div>

			<div class="thead" aria-hidden="true">
				<span>Service</span>
				<span>Category</span>
				<span>Stack</span>
				<span>Year</span>
				<span></span>
			</div>

			{#if list.length}
				<ul class="rows">
					{#each list as item (item.id)}
						<li class="r" id="list-{item.id}">
							<div class="r-main">
								<div class="thumb" style="--from:{item.theme[0]}; --to:{item.theme[1]}">
									{#if item.category === 'internal'}<svg viewBox="0 0 52 52"><path fill-rule="evenodd" clip-rule="evenodd" d="M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z" fill="#fff"/></svg>{:else}{item.name.slice(0, 1)}{/if}
								</div>
								<div>
									<div class="r-title">
										<h3>{item.name}</h3>
										<span class="status status-{item.status}">{statusLabels[item.status]}</span>
									</div>
									<p>{item.description}</p>
									{#if item.makers.length}
										<span class="makers">by {item.makers.join(', ')}</span>
									{/if}
								</div>
							</div>
							<span class="r-cat">{categoryLabels[item.category]}</span>
							<div class="r-stack">
								{#each item.stack as s}<span class="tag">{s}</span>{:else}<span class="dim">—</span>{/each}
							</div>
							<span class="r-year">{item.year}</span>
							<div class="r-cta">
								{#if item.url}
									<a class="icon-link" href={item.url} target="_blank" rel="noopener" aria-label="{item.name} 방문">↗</a>
								{:else}
									<span class="icon-link off" title="준비 중">·</span>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty">
					<h3>{query ? '검색 결과가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}</h3>
					{#if query}<p>다른 키워드로 검색해 보세요.</p>{/if}
				</div>
			{/if}
		</section>

		<!-- ============ SUBMIT ============ -->
		<section class="row submit-row">
			<div class="submit">
				<h2>프로젝트 추가하기</h2>
				<p>부원이 만든 서비스는 <code>src/lib/archives.js</code>에 항목을 추가하면 이 페이지에 표시됩니다.</p>
				<a class="btn btn-line" href="https://github.com/sunrin-ana" target="_blank" rel="noopener">GitHub ↗</a>
			</div>
		</section>
	</div>
</main>

<Footer />

<style>
	main {
		padding-top: var(--nav-h);
	}
	.ok {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #3ddc84;
	}

	/* ---------- Intro ---------- */
	.intro {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 22px;
		padding: 120px 24px 72px;
		border-top: 0;
	}
	.intro-grid {
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image:
			linear-gradient(var(--line) 1px, transparent 1px),
			linear-gradient(90deg, var(--line) 1px, transparent 1px);
		background-size: 56px 56px;
		mask-image: radial-gradient(60% 70% at 50% 0%, #000, transparent 75%);
		-webkit-mask-image: radial-gradient(60% 70% at 50% 0%, #000, transparent 75%);
	}
	.intro h1 {
		margin: 0;
		font-size: clamp(2.4rem, 5.6vw, 4rem);
		font-weight: 500;
		letter-spacing: -0.025em;
	}
	.intro .lede {
		max-width: 620px;
		color: var(--ink-3);
	}

	/* ---------- Featured tiles ---------- */
	.featured {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		padding: 12px;
	}
	.tile {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-height: 540px;
		padding: 48px 32px 0;
		border-radius: var(--radius-lg);
		background: var(--surface-2);
		scroll-margin-top: calc(var(--nav-h) + 24px);
	}
	.tile-status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		color: var(--ink-3);
	}
	.tile-status i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--ok);
	}
	.tile h2 {
		margin: 10px 0 6px;
		font-size: clamp(2.2rem, 4vw, 3.2rem);
		font-weight: 500;
		letter-spacing: -0.025em;
	}
	.tile p {
		margin: 0;
		font-size: 1.05rem;
		color: var(--ink-2);
	}
	.tile-links {
		display: flex;
		align-items: center;
		gap: 18px;
		margin-top: 22px;
	}
	.app-icon {
		margin-top: auto;
		transform: translateY(28%);
		width: 240px;
		aspect-ratio: 1;
		border-radius: 54px;
		background: linear-gradient(160deg, var(--from), var(--to));
		display: grid;
		place-items: center;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			inset 0 -20px 40px rgba(0, 0, 0, 0.12),
			0 40px 60px -30px color-mix(in srgb, var(--to) 70%, transparent);
		transition: transform 0.7s var(--ease-out);
	}
	.tile:hover .app-icon {
		transform: translateY(20%);
	}
	.app-icon :global(svg) {
		width: 44%;
		transform: translateY(-18%);
		filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18));
	}

	/* ---------- Browse ---------- */
	.browse {
		padding: 72px 56px 96px;
	}
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 28px;
	}
	.filters {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.chip {
		font: inherit;
		font-size: 0.9rem;
		font-weight: 500;
		height: 38px;
		padding: 0 16px;
		border-radius: var(--pill);
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-2);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		transition: all 0.15s ease;
	}
	.chip:hover {
		border-color: var(--line-strong);
		color: var(--ink);
	}
	.chip.active {
		background: var(--ink);
		border-color: var(--ink);
		color: #fff;
	}
	.count {
		font-size: 11px;
		color: var(--ink-3);
	}
	.chip.active .count {
		color: rgba(255, 255, 255, 0.75);
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 38px;
		width: min(320px, 100%);
		padding: 0 14px;
		border-radius: var(--pill);
		background: var(--surface-2);
		border: 1px solid transparent;
		transition: border-color 0.15s, background 0.15s;
	}
	.search:focus-within {
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	.search svg {
		width: 15px;
		height: 15px;
		fill: none;
		stroke: var(--ink-3);
		stroke-width: 1.6;
		stroke-linecap: round;
		flex-shrink: 0;
	}
	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		outline: none;
		font: inherit;
		font-size: 0.9rem;
		color: var(--ink);
	}

	.thead,
	.r {
		display: grid;
		grid-template-columns: minmax(0, 2.4fr) 120px minmax(0, 1.2fr) 64px 48px;
		gap: 24px;
		align-items: center;
	}
	.thead {
		padding: 0 0 12px;
		border-bottom: 1px solid var(--ink);
		font-size: 11px;
		color: var(--ink-3);
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.r {
		padding: 24px 0;
		border-bottom: 1px solid var(--line);
		scroll-margin-top: calc(var(--nav-h) + 24px);
		transition: background 0.15s;
	}
	.r:target {
		background: var(--brand-soft);
	}
	.r-main {
		display: flex;
		gap: 18px;
		align-items: flex-start;
	}
	.thumb {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border-radius: 14px;
		background: linear-gradient(160deg, var(--from), var(--to));
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-weight: 500;
		font-size: 1.3rem;
		letter-spacing: -0.03em;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
	}
	.thumb :global(svg) {
		width: 48%;
	}
	.r-title {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.r h3 {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 500;
		letter-spacing: -0.025em;
	}
	.r p {
		margin: 4px 0 0;
		font-size: 0.92rem;
		color: var(--ink-3);
		line-height: 1.55;
	}
	.makers {
		display: inline-block;
		margin-top: 8px;
		font-size: 12px;
		color: var(--ink-3);
	}
	.status {
		font-size: 11px;
		font-weight: 500;
		padding: 2px 8px;
		border-radius: var(--pill);
		background: var(--surface-2);
		color: var(--ink-3);
	}
	.status-live {
		background: #e8f7ee;
		color: #15803d;
	}
	.status-beta {
		background: #fff4e5;
		color: #b45309;
	}
	.r-cat,
	.r-year {
		font-size: 0.88rem;
		color: var(--ink-2);
	}
	.r-year {
		font-size: 12px;
	}
	.r-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.tag {
		font-size: 11px;
		color: var(--ink-2);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 2px 7px;
	}
	.dim {
		color: var(--ink-4);
	}
	.r-cta {
		display: flex;
		justify-content: flex-end;
	}
	.icon-link {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--ink);
		color: #fff;
		text-decoration: none;
		transition: transform 0.2s var(--ease);
	}
	.icon-link:hover {
		transform: rotate(45deg);
	}
	.icon-link.off {
		background: var(--surface-2);
		color: var(--ink-4);
	}

	.empty {
		padding: 88px 24px;
		text-align: center;
		border-bottom: 1px solid var(--line);
	}
	.empty h3 {
		margin: 14px 0 6px;
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: -0.03em;
	}
	.empty p {
		margin: 0;
		color: var(--ink-3);
	}

	/* ---------- Submit ---------- */
	.submit-row {
		padding: 12px;
	}
	.submit {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
		padding: 64px 24px;
		border-radius: var(--radius-lg);
		background: var(--surface-2);
	}
	.submit h2 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.submit p {
		margin: 0 0 8px;
		color: var(--ink-3);
		line-height: 1.65;
	}
	code {
		font-family: var(--font-mono);
		font-size: 0.85em;
		padding: 2px 6px;
		border-radius: 6px;
		background: #fff;
		border: 1px solid var(--line);
		color: var(--ink);
	}

	/* ---------- Responsive ---------- */
	@media (max-width: 1000px) {
		.thead {
			display: none;
		}
		.r {
			grid-template-columns: 1fr auto;
			gap: 12px 16px;
		}
		.r-main {
			grid-column: 1;
		}
		.r-cta {
			grid-column: 2;
			grid-row: 1;
		}
		.r-cat,
		.r-year {
			display: none;
		}
		.r-stack {
			grid-column: 1 / -1;
			padding-left: 74px;
		}
		.browse {
			padding: 56px 24px 72px;
		}
	}
	@media (max-width: 860px) {
		.featured {
			grid-template-columns: 1fr;
		}

	}
	@media (max-width: 640px) {
		.intro {
			padding: 72px 20px 48px;
		}
		.br-lg {
			display: none;
		}
		.featured {
			padding: 8px;
			gap: 8px;
		}
		.tile {
			min-height: 460px;
			padding: 36px 20px 0;
		}
		.app-icon {
			width: 190px;
			border-radius: 44px;
		}
		.browse {
			padding: 48px 20px 64px;
		}
		.search {
			width: 100%;
		}
		.r-stack {
			padding-left: 0;
		}
		.submit-row {
			padding: 8px;
		}
		.submit {
			padding: 64px 20px;
		}
	}
</style>
