<script lang="ts">
	// Header modelled on cloudflare.com: transparent, full-width bar with the menu
	// centred. Once the page scrolls, everything except the mark and the CTA fades
	// away so only those two float over the content.
	import Fa from 'svelte-fa';
	import { faInstagram, faGithub, faFacebook } from '@fortawesome/free-brands-svg-icons';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let isOpen = $state(false);
	let scrolled = $state(false);
	let burger: HTMLButtonElement;
	let sheet: HTMLDivElement;
	let brandEl: HTMLAnchorElement;
	let ctaEl: HTMLButtonElement;

	// pages restored mid-scroll (reload, #hash) start in the right state
	onMount(() => {
		scrolled = window.scrollY > 64;
	});

	// never hide the CTA while it holds keyboard focus
	$effect(() => {
		if (!scrolled && ctaEl && document.activeElement === ctaEl) brandEl?.focus();
	});

	type Item = { label: string; href?: string; soon?: boolean; external?: boolean };

	const items: Item[] = [
		{ label: 'About', href: '/about' },
		{ label: 'Archives', href: '/archives' },
		{ label: 'Curriculum', href: '/curriculum' },
		{ label: 'AnAlog', soon: true, external: true },
		{ label: 'Solve', soon: true, external: true }
	];

	const isActive = (href?: string) => !!href && page.url.pathname.startsWith(href);

	function close() {
		const hadFocus = sheet?.contains(document.activeElement);
		isOpen = false;
		if (hadFocus) burger?.focus();
	}

	$effect(() => {
		if (!isOpen) return;
		const root = document.documentElement;
		const prev = root.style.overflow;
		root.style.overflow = 'hidden';
		const behind = [...document.querySelectorAll('body main, body footer')] as HTMLElement[];
		behind.forEach((el) => (el.inert = true));
		return () => {
			root.style.overflow = prev;
			behind.forEach((el) => (el.inert = false));
		};
	});

	function soon(item: Item) {
		close();
		alert(`${item.label} 페이지는 현재 작업 중에 있습니다! 조금만 기다려주세요!`);
	}

	function join() {
		close();
		const now = Date.now();
		const start = new Date('2026-03-17T12:30:00').getTime();
		const end = new Date('2026-03-19T22:00:00').getTime();
		if (now < start) return alert('지금은 지원 기간이 아닙니다!');
		if (now > end) return alert('지원이 마감되었습니다.');
		window.location.href = 'https://apply.ana.st/';
	}

	// hysteresis so the bar doesn't flicker around the threshold
	let ticking = false;
	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			ticking = false;
			const y = window.scrollY;
			if (!scrolled && y > 64) scrolled = true;
			else if (scrolled && y < 24) scrolled = false;
		});
	};
	const onResize = () => {
		if (window.innerWidth > 860) isOpen = false;
	};
</script>

<svelte:window
	onscroll={onScroll}
	onresize={onResize}
	onkeydown={(e) => {
		if (e.key === 'Escape' && isOpen) close();
	}}
/>

<header class="nav" class:scrolled class:open={isOpen}>
	<div class="bar">
		<a class="brand" bind:this={brandEl} href="/" aria-label="AnA 홈" onclick={() => (isOpen = false)}>
			<svg class="mark" viewBox="0 0 52 52" width="30" height="30" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z" fill="currentColor" /></svg>
		</a>

		<nav class="menu fade" aria-label="Main">
			{#each items as item}
				{#if item.href}
					<a class="item" href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</a>
				{:else}
					<button class="item" type="button" onclick={() => soon(item)}>
						{item.label}{#if item.external}<span class="ext" aria-hidden="true">↗</span>{/if}
					</button>
				{/if}
			{/each}
		</nav>

		<div class="right">
			<div class="pills fade">
				<a class="pill round" style="--k:0" href="https://github.com/sunrin-ana" target="_blank" rel="noopener" aria-label="GitHub">
					<Fa icon={faGithub} />
				</a>
				<a class="pill round" style="--k:1" href="https://instagram.com/sunrin_ana" target="_blank" rel="noopener" aria-label="Instagram">
					<Fa icon={faInstagram} />
				</a>
				<a class="pill round" style="--k:2" href="https://www.facebook.com/sunrinana/" target="_blank" rel="noopener" aria-label="Facebook">
					<Fa icon={faFacebook} />
				</a>
			</div>
			<button class="cta" bind:this={ctaEl} type="button" onclick={join}>지원하기</button>
			<button
				class="burger"
				bind:this={burger}
				type="button"
				aria-label="메뉴"
				aria-controls="nav-sheet"
				aria-expanded={isOpen}
				onclick={() => (isOpen = !isOpen)}
			>
				<span></span><span></span>
			</button>
		</div>
	</div>

	<div class="sheet" id="nav-sheet" bind:this={sheet} class:open={isOpen} inert={!isOpen}>
		<div class="sheet-inner">
			{#each items as item, i}
				{#if item.href}
					<a
						class="s-link"
						class:active={isActive(item.href)}
						aria-current={isActive(item.href) ? 'page' : undefined}
						style="--i:{i}"
						href={item.href}
						onclick={() => (isOpen = false)}>{item.label}</a
					>
				{:else}
					<button class="s-link" style="--i:{i}" type="button" onclick={() => soon(item)}>
						{item.label}{#if item.external}<span class="ext" aria-hidden="true">↗</span>{/if}
					</button>
				{/if}
			{/each}
			<div class="s-foot" style="--i:{items.length}">
				<button class="s-cta" type="button" onclick={join}>지원하기</button>
				<div class="s-pills">
					<a class="pill round" href="https://github.com/sunrin-ana" target="_blank" rel="noopener" aria-label="GitHub"><Fa icon={faGithub} /></a>
					<a class="pill round" href="https://instagram.com/sunrin_ana" target="_blank" rel="noopener" aria-label="Instagram"><Fa icon={faInstagram} /></a>
					<a class="pill round" href="https://www.facebook.com/sunrinana/" target="_blank" rel="noopener" aria-label="Facebook"><Fa icon={faFacebook} /></a>
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	.nav {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 100;
		pointer-events: none;
	}
	.bar {
		position: relative;
		height: var(--nav-h);
		display: flex;
		align-items: center;
		padding: 0 24px;
	}
	.bar > * {
		pointer-events: auto;
	}

	button {
		font: inherit;
		color: inherit;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
	}

	/* scroll fade: everything but the mark and CTA eases up and out.
	   `translate` is used (not transform) so centring transforms stay intact. */
	.fade {
		--ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
		transition:
			opacity 0.5s var(--ease-soft),
			translate 0.5s var(--ease-soft),
			filter 0.5s var(--ease-soft),
			visibility 0s linear 0s;
	}
	@media (min-width: 861px) {
	.scrolled:not(.open) .fade {
		opacity: 0;
		translate: 0 -6px;
		filter: blur(2px);
		visibility: hidden;
		transition:
			opacity 0.35s var(--ease-soft),
			translate 0.35s var(--ease-soft),
			filter 0.35s var(--ease-soft),
			visibility 0s linear 0.35s;
	}
	}

	/* brand */
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 44px;
		padding: 0 8px;
		margin-left: -8px;
		border-radius: 6px;
		text-decoration: none;
		color: var(--ink);
	}
	.mark {
		color: var(--brand-ink);
		width: 30px;
		height: 30px;
	}

	/* centred menu */
	.menu {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
	}
	.item {
		display: flex;
		align-items: center;
		height: 36px;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
		transition: opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1);
	}
	.item:hover {
		opacity: 0.8;
	}
	.item[aria-current='page'] {
		color: var(--brand);
	}
	.ext {
		margin-left: 3px;
		font-size: 0.75em;
		color: var(--ink-3);
	}

	/* right side */
	.right {
		margin-left: auto;
		position: relative;
		display: flex;
		align-items: center;
		height: 38px;
	}
	.pills {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 38px;
		padding: 6px 14px;
		border: 1px solid var(--pill-border);
		border-radius: 999px;
		background: color-mix(in srgb, var(--surface) 60%, transparent);
		font-size: 1rem;
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}
	.pill:hover {
		border-color: var(--line-2);
		background: var(--surface);
	}
	.pill :global(svg) {
		font-size: 1.05rem;
	}
	.pill.round {
		width: 38px;
		padding: 0;
		justify-content: center;
	}
	.cta {
		position: absolute;
		right: 0;
		top: 50%;
		height: 35px;
		padding: 6px 14px;
		border: 1px solid var(--brand);
		border-radius: 999px;
		background: var(--brand);
		color: var(--on-brand);
		font-size: 1rem;
		font-weight: 500;
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-50%);
		translate: 10px 0;
		scale: 0.94;
		transition:
			opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1),
			translate 0.3s cubic-bezier(0.22, 1, 0.36, 1),
			scale 0.3s cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s linear 0.3s,
			background 0.2s ease;
	}
	.scrolled:not(.open) .cta {
		opacity: 1;
		visibility: visible;
		translate: 0 0;
		scale: 1;
		transition:
			opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.12s,
			translate 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.12s,
			scale 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.12s,
			visibility 0s linear 0s,
			background 0.2s ease;
	}
	.cta:hover {
		background: var(--brand-2);
	}

	/* burger (mobile) */
	.burger {
		display: none;
		position: relative;
		width: 40px;
		height: 40px;
		margin-right: -8px;
		border-radius: 999px;
	}
	.burger span {
		position: absolute;
		left: 11px;
		right: 11px;
		height: 1.5px;
		border-radius: 1px;
		background: var(--ink);
		transition:
			transform 0.3s var(--ease),
			top 0.3s var(--ease);
	}
	.burger span:first-child {
		top: 16px;
	}
	.burger span:last-child {
		top: 23px;
	}
	.open .burger span:first-child {
		top: 19.5px;
		transform: rotate(45deg);
	}
	.open .burger span:last-child {
		top: 19.5px;
		transform: rotate(-45deg);
	}

	.sheet {
		display: none;
	}

	@media (max-width: 860px) {
		.nav {
			pointer-events: auto;
			background: color-mix(in srgb, var(--surface) 90%, transparent);
			backdrop-filter: saturate(180%) blur(12px);
			-webkit-backdrop-filter: saturate(180%) blur(12px);
		}
		.nav.scrolled,
		.nav.open {
			box-shadow: 0 1px 0 var(--line);
		}
		.bar {
			padding: 0 20px;
		}
		.menu,
		.pills,
		.cta {
			display: none;
		}
		.burger {
			display: block;
		}
		.mark {
			width: 26px;
			height: 26px;
		}
		.sheet {
			display: block;
			height: 0;
			overflow: hidden;
			background: var(--surface);
			transition: height 0.4s var(--ease);
		}
		.sheet.open {
			height: calc(100dvh - var(--nav-h));
			overflow-y: auto;
			overscroll-behavior: contain;
		}
		.sheet-inner {
			display: flex;
			flex-direction: column;
			padding: 8px 20px 32px;
		}
		.s-link {
			display: flex;
			align-items: baseline;
			padding: 14px 0;
			font-size: 1.6rem;
			font-weight: 500;
			letter-spacing: -0.025em;
			color: var(--ink-3);
			text-decoration: none;
			text-align: left;
			opacity: 0;
			transform: translateY(-6px);
		}
		.s-link.active {
			color: var(--ink);
		}
		.s-foot {
			display: flex;
			flex-direction: column;
			gap: 16px;
			margin-top: 20px;
			padding-top: 24px;
			border-top: 1px solid var(--line);
			opacity: 0;
			transform: translateY(-6px);
		}
		.s-cta {
			height: 46px;
			border-radius: 999px;
			background: var(--brand);
			color: var(--on-brand);
			font-size: 1rem;
			font-weight: 500;
		}
		.s-pills {
			display: flex;
			gap: 6px;
			flex-wrap: wrap;
		}
		.sheet.open .s-link,
		.sheet.open .s-foot {
			opacity: 1;
			transform: none;
			transition:
				opacity 0.35s ease,
				transform 0.35s var(--ease);
			transition-delay: calc(0.06s + var(--i) * 0.04s);
		}
	}
</style>
