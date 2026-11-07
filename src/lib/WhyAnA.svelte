<script lang="ts">
	// "Why AnA" — modelled on cloudflare.com's "Why choose Cloudflare" block:
	// a rotating subtitle, a left panel of drifting incident cards over a scrolling
	// pixel waveform, and a right brand panel with a live-counting toast.
	import { onMount } from 'svelte';

	/* ---------------- content ---------------- */
	type Card = {
		title?: string;
		description: string;
		icon?: 'alert' | 'bell' | 'message' | 'user' | 'target' | 'lock' | 'shield' | 'globe' | 'db';
		priority?: string;
		accent?: string;
		layout?: 'vertical' | 'horizontal';
		stack?: number;
		position: [number, number];
	};

	const cards: Card[] = [
		{ description: '"로컬에선 되는데 서버에서만 안 돼요… 내일이 발표인데."', position: [-0.3, 0.2] },
		{ description: 'BUILD: FAILED', icon: 'alert', accent: '#F5B800', position: [0.1, 0.025], layout: 'horizontal' },
		{ description: '37 Open issues', icon: 'bell', accent: '#FF4800', position: [-0.1, 0.65] },
		{ description: 'PR 리뷰어 없음', icon: 'message', accent: '#ED1619', position: [0.15, 1.1], layout: 'horizontal' },
		{ title: '502 Bad Gateway!!!!!!', description: '서버가 또 내려갔습니다', priority: 'P0', accent: '#ED1641', position: [0.05, 0.45], stack: 3 },
		{ description: '"API 키를 GitHub에 그대로 올려버렸어요."', icon: 'user', accent: '#9616FF', position: [0.25, 0.75], layout: 'horizontal' },
		{ title: '디스크 용량 부족', description: '로그 파일이 서버 용량의 98%를 차지하고 있습니다.', icon: 'alert', accent: '#F5B800', position: [-0.2, 0.9], stack: 2 },
		{ title: '새내기 개발자', description: '"에러 나서 node_modules까지 통째로 커밋했어요."', icon: 'user', accent: '#9616FF', position: [-0.65, 0.3] },
		{ description: '"Docker는 들어만 봤는데… 배포는 어떻게 하는 거죠?"', position: [-0.55, 0.55] },
		{ title: 'Merge conflict', description: 'main 브랜치에서 충돌 214건이 발생했습니다.', priority: 'P0', icon: 'target', accent: '#ED1641', position: [0.35, 0.15], stack: 2 },
		{ description: '"참고한 Stack Overflow 답변이 2014년 거예요."', icon: 'user', accent: '#9616FF', position: [-0.4, -0.05], layout: 'horizontal' },
		{ title: 'DB 접속 실패', description: 'too many connections — 연결이 반환되지 않고 있습니다.', icon: 'db', accent: '#FF4800', position: [0.4, 0.55] },
		{ description: '.env 파일이 public 저장소에 올라갔습니다.', icon: 'shield', accent: '#F5B800', position: [0.5, 0.95], layout: 'horizontal' },
		{ title: '새벽 3시 배포', description: '롤백 방법을 아무도 모릅니다.', icon: 'globe', accent: '#ED1619', position: [-0.5, 0.78] }
	];

	// subtitle phrases; the toast follows the active one
	const prefix = 'AnA에서는';
	const variants = ['직접 만들고 배포하는 법을 배웁니다', '서버와 아키텍처까지 설계해봅니다'];
	const toasts = [
		{ pre: '커밋', post: '개 푸시 완료', first: 72, next: () => 16 + Math.floor(Math.random() * 184) },
		{ pre: '테스트', post: '개 통과', first: 320, next: (n: number) => [320, 1280, 5120][([320, 1280, 5120].indexOf(n) + 1) % 3] }
	];

	/* ---------------- waveform (procedural pixel waveform, 5px grid) ---------------- */
	const WF_W = 1192,
		WF_H = 222;
	const wavePath = (() => {
		let seed = 0x2f50e0;
		const rnd = () => {
			seed |= 0;
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
		const c = WF_H / 2;
		let d = '';
		for (let x = 0; x <= WF_W - 5; x += 5) {
			const env = Math.abs(Math.sin(x * 0.0061) * Math.sin(x * 0.0173 + 1.3)) * 0.75 + Math.abs(Math.sin(x * 0.041)) * 0.25;
			if (rnd() < 0.18 * (1 - env)) continue;
			const A = Math.max(5, Math.round((env * (0.55 + 0.45 * rnd()) * c * 0.95) / 5) * 5);
			for (let y = c - A; y <= c + A; y += 5) {
				const k = Math.abs(y - c) / A;
				if (rnd() < 0.92 * Math.pow(1 - k, 0.55) + 0.04) d += `M${x} ${y}h1v1h-1z`;
			}
		}
		return d;
	})();

	/* ---------------- runtime state ---------------- */
	let active = $state(0);
	let words = $state(variants[0].split(' '));
	let leaving = $state(false);
	let count = $state(toasts[0].first);
	let pillW = $state<number | null>(null);

	let root: HTMLElement;
	let measure: HTMLSpanElement;
	let cardEls: HTMLDivElement[] = $state([]);
	let toastEl: HTMLDivElement;
	let started = $state(false);

	const fmt = (n: number) => n.toLocaleString('en-US');
	let digits = $derived(fmt(count).split(''));

	// flat list of rendered card copies (stacks render several)
	const copies = cards.flatMap((c, ci) =>
		Array.from({ length: c.stack ?? 1 }, (_, k) => ({ card: c, ci, k }))
	);
	// stable per-card timing, like the original's random-at-mount values
	const timing = cards.map((_, i) => {
		const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
		return {
			duration: 6000 + r(1) * 4000,
			delay: r(2) * 3000,
			amp: 5 + r(3) * 10,
			float: 3000 + r(4) * 3000
		};
	});

	onMount(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const later = (fn: () => void, ms: number) => {
			const t = setTimeout(() => {
				timers.delete(t);
				fn();
			}, ms);
			timers.add(t);
		};
		const anims = new Set<Animation>();
		const floats = new WeakMap<HTMLElement, Animation>();
		let alive = true;

		const sizePill = () => {
			if (measure) pillW = Math.ceil(measure.offsetWidth);
		};
		sizePill();

		function begin() {
			if (started) return;
			started = true;

			// toast pops in after 1s
			toastEl?.animate(
				[
					{ opacity: 0, transform: 'scale(0.7)' },
					{ opacity: 1, transform: 'scale(1)' }
				],
				{ duration: reduce ? 0 : 400, delay: reduce ? 0 : 1000, easing: 'cubic-bezier(0.33,1,0.68,1)', fill: 'both' }
			);

			if (reduce) return;

			// subtitle rotation every 3.4s
			const rotate = () => {
				if (!alive) return;
				leaving = true;
				later(() => {
					active = (active + 1) % variants.length;
					words = variants[active].split(' ');
					leaving = false;
					count = toasts[active].first;
					requestAnimationFrame(sizePill);
					later(rotate, 3400);
				}, 260);
			};
			later(rotate, 3400);

			// counter ticks every 3s
			const tick = () => {
				if (!alive) return;
				count = toasts[active].next(count);
				later(tick, 3000);
			};
			later(tick, 3000);

			// drifting cards
			cards.forEach((card, ci) => {
				const { duration, delay, amp, float } = timing[ci];
				const els = copies.map((c, i) => (c.ci === ci ? cardEls[i] : null)).filter(Boolean) as HTMLDivElement[];
				const n = els.length;
				const x = card.position[0] * 100,
					y = card.position[1] * 100;

				const runOne = (el: HTMLDivElement, k: number, onDone?: () => void) => {
					if (!alive || !el) return;
					const o = k * 32;
					const at = (dx: number, s: number) =>
						`translate(calc(${x + dx}% + ${o}px), calc(${y}% + ${o}px)) scale(${s})`;
					const total = 400 + duration + 400;
					const a = el.animate(
						[
							{ offset: 0, opacity: 0, transform: at(0, 0.7), easing: 'cubic-bezier(0.33,1,0.68,1)' },
							{ offset: 400 / total, opacity: 0.9, transform: at(0, 1), easing: 'linear' },
							{ offset: (400 + duration) / total, opacity: 0.9, transform: at(200, 1), easing: 'cubic-bezier(0.33,1,0.68,1)' },
							{ offset: 1, opacity: 0, transform: at(200, 0) }
						],
						{ duration: total, fill: 'both' }
					);
					anims.add(a);
					// the bob runs once per element for its whole life (never re-stacked)
					const inner = el.firstElementChild as HTMLElement | null;
					if (inner && !floats.has(inner)) {
						const f = inner.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${amp}px)` }], {
							duration: float,
							direction: 'alternate',
							iterations: Infinity,
							easing: 'ease-in-out'
						});
						floats.set(inner, f);
						anims.add(f);
					}
					a.finished
						.then(() => onDone?.())
						.catch(() => {})
						.finally(() => anims.delete(a));
				};

				const cycle = () => {
					if (!alive) return;
					if (n <= 1) {
						runOne(els[0], 0, () => later(cycle, 500));
						return;
					}
					els.forEach((el, k) =>
						later(
							() =>
								runOne(el, k, k === 0
									? () => {
											els.slice(1).forEach((other) =>
												other.animate([{ transform: getComputedStyle(other).transform, opacity: getComputedStyle(other).opacity }, { transform: getComputedStyle(other).transform + ' scale(0)', opacity: 0 }], {
													duration: 400,
													easing: 'cubic-bezier(0.33,1,0.68,1)',
													fill: 'forwards'
												})
											);
											later(cycle, 500);
										}
									: undefined),
							k * 200
						)
					);
				};
				later(cycle, delay);
			});
		}

		const io = new IntersectionObserver(
			(es) => {
				if (es.some((e) => e.isIntersecting)) {
					begin();
					io.disconnect();
				}
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		io.observe(root);

		const ro = new ResizeObserver(sizePill);
		ro.observe(root);
		if (measure) ro.observe(measure);
		document.fonts?.ready.then(() => alive && sizePill());

		return () => {
			alive = false;
			io.disconnect();
			ro.disconnect();
			timers.forEach(clearTimeout);
			anims.forEach((a) => a.cancel());
		};
	});
</script>

{#snippet icon(name: string)}
	<svg viewBox="0 0 24 24" aria-hidden="true">
		{#if name === 'alert'}
			<path d="M12 4.5 2.8 19.5h18.4L12 4.5z" /><path d="M12 10v4M12 16.8v.2" />
		{:else if name === 'bell'}
			<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5l1.5-1.5z" /><path d="M10 20.5a2 2 0 0 0 4 0M3.5 8.5c.6-2 1.8-3.6 3.4-4.6M20.5 8.5c-.6-2-1.8-3.6-3.4-4.6" />
		{:else if name === 'message'}
			<path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" /><path d="M8 10h8M8 13h5" />
		{:else if name === 'user'}
			<circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.2c1.2-2 3.1-3.2 5.5-3.2s4.3 1.2 5.5 3.2" />
		{:else if name === 'target'}
			<circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" />
		{:else if name === 'lock'}
			<rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
		{:else if name === 'shield'}
			<path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6l7-2.5z" /><path d="M12 9v6M9 12h6" />
		{:else if name === 'globe'}
			<circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5S9.7 5.9 12 3.5z" />
		{:else if name === 'db'}
			<ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
		{:else if name === 'check'}
			<path d="M5 12.5l4.5 4.5L19 7.5" />
		{/if}
	</svg>
{/snippet}

<section class="why" bind:this={root}>
	<header class="head">
		<h2>Why AnA</h2>
		<p class="sub">
			<span>{prefix}</span><span
				class="pill"
				style={pillW ? `width:${pillW}px` : ''}
			>
				{#each words as w, i (active + '-' + i)}
					<span class="word" class:out={leaving} style="--i:{i}">{w}</span>{#if i < words.length - 1}<span class="sp">&nbsp;</span>{/if}
				{/each}
				<span class="pill-bg" aria-hidden="true"></span>
				<span class="pill-noise" aria-hidden="true"><span></span></span>
			</span>
			<span class="measure" bind:this={measure} aria-hidden="true">{variants[active]}</span>
		</p>
	</header>

	<div class="grid">
		<!-- scrolling pixel waveform behind both panels -->
		<div class="wave" aria-hidden="true">
			<div class="wave-track">
				{#each [0, 1] as _}
					<svg viewBox="0 0 {WF_W} {WF_H}" width={WF_W} height={WF_H}><path d={wavePath} /></svg>
				{/each}
			</div>
		</div>

		<div class="panel left">
			<h3>혼자 부딪히는<br />개발</h3>
			<div class="popups" aria-hidden="true">
				{#each copies as c, i}
					<div class="card-pos" bind:this={cardEls[i]} style="z-index:{10 + c.k}; top:{c.card.position[1] * 100}%; left:{c.card.position[0] * 100}%">
						<div class="card">
							<svg class="dash" aria-hidden="true"><rect x="0.5" y="0.5" rx="8" ry="8" /></svg>
							<div class="card-body" class:row={c.card.layout === 'horizontal'}>
								{#if c.card.icon}<span class="ic" style="color:{c.card.accent}">{@render icon(c.card.icon)}</span>{/if}
								{#if c.card.priority}<span class="prio" style="color:{c.card.accent}; background:{c.card.accent}1A">{c.card.priority}</span>{/if}
								{#if c.card.title}<small class="t">{c.card.title}</small>{/if}
								<small class="d">{c.card.description}</small>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="panel right">
			<h3>AnA와 함께<br />만드는 개발</h3>
			<div class="dots" aria-hidden="true">
				<div class="dots-row">
					{#each Array(160) as _}<i></i>{/each}
				</div>
			</div>
			<div class="toast-wrap" bind:this={toastEl}>
				<div class="toast" aria-hidden="true">
					<span class="check">{@render icon('check')}</span>
					<span class="swap">
						{#each toasts as t, i}<span class:on={i === active}>{t.pre}</span>{/each}
					</span>
					<span class="num">
						{#each digits as ch, i (digits.length - i)}
							{#if /\d/.test(ch)}
								<span class="digit"><span class="strip" style="--d:{ch}">{#each Array(10) as _, n}<span>{n}</span>{/each}</span></span>
							{:else}
								<span class="sym">{ch}</span>
							{/if}
						{/each}
					</span>
					<span class="swap">
						{#each toasts as t, i}<span class:on={i === active}>{t.post}</span>{/each}
					</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.why {
		--accent: var(--brand);
		--accent-ink: var(--brand-deep);
	}

	/* ---------- heading ---------- */
	.head {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 112px 24px 56px;
	}
	h2 {
		margin: 0;
		font-size: clamp(2.25rem, 4.2vw, 3rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.025em;
		color: var(--ink);
	}
	.sub {
		position: relative;
		margin: 16px 0 0;
		font-size: clamp(1rem, 1.35vw, 1.2rem);
		line-height: 1.5;
		color: color-mix(in srgb, var(--ink) 70%, transparent);
	}
	.pill {
		position: relative;
		display: inline-flex;
		align-items: baseline;
		vertical-align: baseline;
		overflow: hidden;
		padding: 0.1em 0.22em;
		margin: -0.1em 4px;
		color: var(--accent-ink);
		white-space: nowrap;
		transition: width 0.22s cubic-bezier(0.25, 0.1, 0.25, 1);
	}
	.word,
	.sp {
		position: relative;
		z-index: 2;
		display: inline-block;
		white-space: pre;
	}
	.word {
		animation: word-in 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) both;
		animation-delay: calc(var(--i) * 40ms);
	}
	.word.out {
		animation: word-out 0.22s cubic-bezier(0.25, 0.1, 0.25, 1) both;
		animation-delay: calc(var(--i) * 30ms);
	}
	@keyframes word-in {
		from {
			opacity: 0;
			filter: blur(4px);
			transform: translateY(4px);
		}
	}
	@keyframes word-out {
		to {
			opacity: 0;
			filter: blur(4px);
			transform: translateY(-4px);
		}
	}
	.pill-bg {
		position: absolute;
		inset: 0;
		border-radius: 5px;
		background: color-mix(in srgb, var(--accent) 3%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent);
	}
	.pill-noise {
		position: absolute;
		inset: 0;
		border-radius: 5px;
		overflow: hidden;
		mix-blend-mode: multiply;
	}
	@media (prefers-color-scheme: dark) {
		.pill {
			mix-blend-mode: screen;
		}
	}
	.pill-noise span {
		position: absolute;
		inset: 0 auto 0 0;
		width: 200%;
		background-image:
			radial-gradient(55% 70% at 0% 28%, color-mix(in srgb, var(--accent-2) 20%, transparent), transparent 70%),
			radial-gradient(55% 70% at 100% 28%, color-mix(in srgb, var(--accent-2) 20%, transparent), transparent 70%),
			radial-gradient(55% 65% at 50% 72%, color-mix(in srgb, var(--brand-deep) 14%, transparent), color-mix(in srgb, var(--brand-deep) 1%, transparent) 70%),
			radial-gradient(40% 60% at 50% 45%, color-mix(in srgb, var(--brand) 5%, transparent), color-mix(in srgb, var(--brand-deep) 1%, transparent) 75%);
		background-size: 50% 100%;
		background-repeat: repeat-x;
		animation: noise-drift 2s linear infinite;
	}
	@keyframes noise-drift {
		from {
			transform: translateX(-50%);
		}
		to {
			transform: translateX(0);
		}
	}
	.measure {
		position: absolute;
		visibility: hidden;
		white-space: nowrap;
		padding: 0.1em 0.22em;
		left: 0;
		top: 0;
	}

	/* ---------- grid ---------- */
	.grid {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 500px;
		max-width: var(--frame);
		margin: 0 auto;
		border: 1px solid var(--line);
		background: var(--surface);
	}
	.panel {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 48px;
		text-align: center;
	}
	h3 {
		position: relative;
		z-index: 1;
		margin: 0;
		font-size: clamp(2rem, 3.6vw, 3rem);
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: -0.025em;
	}
	.left {
		border-right: 1px solid var(--line);
		color: var(--ink);
	}
	.right {
		background: var(--brand-fill);
		color: var(--on-fill);
		box-shadow:
			inset 1px 6px 6px 0 rgba(255, 255, 255, 0.2),
			inset 0 0 0 0 rgba(255, 255, 255, 0.35),
			0 4px 12px 0 rgba(0, 0, 0, 0.02),
			0 2px 12px 0 rgba(0, 0, 0, 0.03);
	}

	/* waveform */
	.wave {
		position: absolute;
		inset: 0;
		margin-top: 5%;
		overflow: hidden;
		pointer-events: none;
		transform: scaleX(-1);
		opacity: 0;
		animation: fade-in 1s ease-out 0.2s both;
	}
	.wave-track {
		display: flex;
		width: max-content;
		align-items: center;
		height: 100%;
		animation: wave-scroll 20s linear infinite;
	}
	.wave svg {
		flex-shrink: 0;
		height: auto;
		max-height: 50%;
		width: auto;
	}
	.wave path {
		fill: var(--accent-2);
	}
	@keyframes wave-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
	@keyframes fade-in {
		to {
			opacity: 1;
		}
	}

	/* popups */
	.popups {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.card-pos {
		position: absolute;
		flex-shrink: 0;
		opacity: 0;
		transform: scale(0.7);
		will-change: transform, opacity;
	}
	.card {
		position: relative;
		border-radius: 8px;
		background: var(--card);
	}
	.dash {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 3;
		pointer-events: none;
		overflow: visible;
	}
	.dash rect {
		width: calc(100% - 1px);
		height: calc(100% - 1px);
		fill: none;
		stroke: var(--line);
		stroke-width: 1;
		stroke-dasharray: 8 8;
		stroke-linecap: round;
	}
	.card-body {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 192px;
		max-width: 320px;
		padding: 10px 12px;
		text-align: left;
		overflow: hidden;
	}
	.card-body.row {
		flex-direction: row;
		align-items: flex-start;
	}
	.ic {
		display: inline-flex;
		flex-shrink: 0;
		margin-bottom: 4px;
	}
	.row .ic {
		margin: 0 4px 0 0;
	}
	.ic :global(svg) {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.prio {
		margin-bottom: 4px;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 500;
	}
	.t,
	.d {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.45;
		letter-spacing: -0.04em;
	}
	.t {
		color: var(--ink);
	}
	.d {
		color: var(--ink-3);
	}

	/* right: dotted rail + toast */
	.dots {
		position: absolute;
		inset: 0;
		margin-top: 10%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.dots-row {
		display: flex;
		gap: 4px;
		opacity: 0;
		animation:
			fade-in 1s ease-out 1.5s both,
			marquee 8s linear infinite;
	}
	.dots-row i {
		width: 2px;
		aspect-ratio: 1;
		background: color-mix(in srgb, var(--on-fill) 30%, transparent);
	}
	@keyframes marquee {
		from {
			transform: translateX(-10%);
		}
		to {
			transform: translateX(10%);
		}
	}
	.toast-wrap {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: scale(0.7);
	}
	.toast {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 10%;
		padding: 16px;
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--on-fill) 20%, transparent);
		background: color-mix(in srgb, var(--accent-2) 50%, transparent);
		backdrop-filter: blur(1px);
		color: var(--on-fill);
		font-size: 1.05rem;
		white-space: nowrap;
	}
	.check {
		display: inline-flex;
	}
	.check :global(svg) {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.swap {
		position: relative;
		display: inline-block;
	}
	.swap > span {
		position: absolute;
		left: 0;
		top: 0;
		white-space: nowrap;
		opacity: 0;
		filter: blur(4px);
		transition:
			opacity 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
			filter 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
		visibility: hidden;
	}
	.swap > span.on {
		position: relative;
		opacity: 1;
		filter: blur(0);
		visibility: visible;
	}
	.num {
		display: inline-flex;
		font-variant-numeric: tabular-nums;
	}
	.digit {
		display: inline-block;
		height: 1.25em;
		overflow: hidden;
		line-height: 1.25em;
	}
	.strip {
		display: flex;
		flex-direction: column;
		transform: translateY(calc(var(--d) * -1.25em));
		transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.strip span {
		height: 1.25em;
	}
	.sym {
		line-height: 1.25em;
	}

	/* ---------- responsive ---------- */
	@media (max-width: 767px) {
		.head {
			padding: 80px 20px 40px;
		}
		.sub {
			max-width: 22em;
		}
		.pill {
			white-space: normal;
			width: auto !important;
		}
		.measure {
			display: none;
		}
		.grid {
			grid-template-columns: 1fr;
			min-height: 800px;
			border-left: 0;
			border-right: 0;
		}
		.left {
			border-right: 0;
			border-bottom: 1px solid var(--line);
		}
		.wave {
			display: none;
		}
		.panel {
			padding: 40px 20px;
		}
		.toast {
			font-size: 0.95rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wave,
		.dots-row {
			animation: none;
			opacity: 1;
		}
		.wave-track,
		.pill-noise span {
			animation: none;
		}
		.card-pos {
			display: none;
		}
	}
</style>
