<script lang="ts">
	// Shown when /archives/<id> has no matching project (or the load fails):
	// keeps the site chrome and leads back to the list.
	import { page } from '$app/state';
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? '찾을 수 없음' : '오류'} — Archives — AnA</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Nav />

<main>
	<div class="frame">
		<section class="row bare err">
			<p class="code">{page.status}</p>
			<h1>{page.error?.message ?? '페이지를 불러오지 못했습니다.'}</h1>
			<a class="btn btn-line" href="/archives">Archives로 돌아가기</a>
		</section>
	</div>
</main>

<Footer />

<style>
	main {
		padding-top: var(--nav-h);
	}
	.err {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 20px;
		padding: 140px 24px 160px;
	}
	.code {
		margin: 0;
		font-size: 1rem;
		color: var(--ink-3);
	}
	h1 {
		margin: 0;
		font-size: clamp(1.8rem, 3.4vw, 2.6rem);
		font-weight: 500;
		line-height: 1.2;
		letter-spacing: -0.025em;
	}
	.btn {
		margin-top: 12px;
	}
	@media (max-width: 640px) {
		.err {
			padding: 96px 20px 112px;
		}
	}
</style>
