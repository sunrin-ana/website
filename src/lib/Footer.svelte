<script lang="ts">
	const year = new Date().getFullYear();

	const links = [
		{ label: 'About', href: '/about' },
		{ label: 'Archives', href: '/archives' },
		{ label: 'Curriculum', href: '/curriculum' },
		{ label: 'GitHub', href: 'https://github.com/sunrin-ana' },
		{ label: 'Instagram', href: 'https://instagram.com/sunrin_ana' },
		{ label: 'Facebook', href: 'https://www.facebook.com/sunrinana/' }
	];
	const ext = (href: string) => href.startsWith('http');
</script>

<footer>
	<div class="inner">
		<div class="top">
			<a class="brand" href="/" aria-label="AnA 홈">
				<svg class="f-mark" viewBox="0 0 52 52" width="22" height="22" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z" fill="currentColor" /></svg>
				<span>AnA</span>
			</a>
			<nav aria-label="Footer">
				{#each links as l}
					<a href={l.href} target={ext(l.href) ? '_blank' : undefined} rel={ext(l.href) ? 'noopener' : undefined}>
						{l.label}
					</a>
				{/each}
			</nav>
		</div>
		<p class="bottom">
			© {year} AnA · 선린인터넷고등학교 소프트웨어과 전공동아리 ·
			<a href="mailto:ana@sunrint.hs.kr">ana@sunrint.hs.kr</a>
		</p>
	</div>
</footer>

<style>
	.f-mark {
		color: var(--brand-ink);
	}
	footer {
		border-top: 1px solid var(--line);
		background: var(--surface);
	}
	.inner {
		max-width: var(--frame);
		margin: 0 auto;
		padding: 40px 24px 36px;
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		flex-wrap: wrap;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 500;
		font-size: 1rem;
		color: var(--ink);
		text-decoration: none;
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 24px;
	}
	nav a,
	.bottom a {
		color: var(--ink-2);
		text-decoration: none;
		font-size: 0.92rem;
	}
	nav a:hover,
	.bottom a:hover {
		color: var(--ink);
	}
	.bottom {
		margin: 24px 0 0;
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--ink-3);
	}
	.bottom a {
		font-size: inherit;
		color: var(--ink-3);
	}
</style>
