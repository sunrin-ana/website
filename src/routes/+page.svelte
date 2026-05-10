<script>
	import Halftone from "$lib/Halftone.svelte";
	import Nav from "$lib/Nav.svelte";
	import { goto } from '$app/navigation';
</script>

<Nav></Nav>

<main>
    <Halftone />
	<p id=hero>
		새로운 도약과 함께 성장하는 <span
		class="cp"
	>AnA</span><br/>
		<strong>Application & Architecture</strong>
	</p>
</main>

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
		border: 0;
		background: transparent;
		padding: 0;
		margin: 0;
		font: inherit;
		font-weight: 700;
	}
</style>
