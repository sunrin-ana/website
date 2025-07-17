<script>
	import Halftone from "$lib/Halftone.svelte";
	import Nav from "$lib/Nav.svelte";
</script>

<Nav></Nav>

<main>
    <Halftone />
	<p id=hero>
		새로운 도약과 함께 성장하는 <strong class="cp">AnA</strong><br/>
		<strong>Application & Architecture</strong>
	</p>
</main>
<section>
</section>

<style>
	main {
		display: flex;

		flex-flow: column;
		justify-content: center;
		align-items: center;

		width: 100%;
		height: 100vh;
	}

	#hero {
		text-align: center;
		font-size: 1.5rem;
	}

	.cp {
		color: #334882;
	}
</style>