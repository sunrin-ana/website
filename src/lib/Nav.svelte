<script lang="ts">
	import Fa from 'svelte-fa';
	import { faFacebook, faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';
	import { goto } from '$app/navigation';

	let isOpen = false;

	const screens = ['About', 'Curriculum'] as const;
	const pages = ['AnAlog', 'Solve', 'Join'] as const;
	type PageName = (typeof pages)[number];

	const toggleMenu = () => {
		isOpen = !isOpen;
	};

	const needToWorkOn = (page: PageName) => {
		if (page === 'Join') {
			const now = new Date();
			const start = new Date('2026-03-17T12:30:00');
			const end = new Date('2026-03-19T22:00:00');
			const diff = end.getTime() - now.getTime();
			const startDiff = start.getTime() - now.getTime();

			if (startDiff > 0) {
				alert('지금은 지원 기간이 아닙니다!')
				return
			}
			else if (diff < 0) {
				alert('지원이 마감되었습니다.')
				return
			}
			window.location.href = "https://apply.ana.st/"
			return;
		}
		alert(`${page} 페이지는 현재 작업 중에 있습니다! 조금만 기다려주세요!`);
	};

	const handleResize = () => {
		if (window.innerWidth > 768) {
			isOpen = false;
		}
	};
</script>

<svelte:window on:resize={handleResize} />

<div class="navbar-container">
	<button class="logo-button" on:click={() => goto('/')} aria-label="Go to home">
		<img class="logo-image" src="/logo.svg" alt="logo" />
	</button>

	<button
		class="hamburger-icon"
		on:click={toggleMenu}
		class:open={isOpen}
		type="button"
		aria-label="Toggle menu"
		aria-expanded={isOpen}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
			<path d="M2 2L18 2" stroke="black" stroke-width="3" stroke-linecap="round" />
			<path d="M2 8L18 8" stroke="black" stroke-width="3" stroke-linecap="round" />
			<path d="M2 14H18" stroke="black" stroke-width="3" stroke-linecap="round" />
		</svg>
	</button>

	<div class="navbar-menu" class:open={isOpen}>
		<div class="navbar-menu-items">
			{#each screens as screen, i}
				<button
					class="navbar-menu-item"
					on:click={() => {if (screen === 'Curriculum') alert("페이지는 현재 작업 중에 있습니다."); else goto("/"+screen.toLowerCase())}}
					style="--delay-index: {i}"
					type="button"
				>
					{screen}
				</button>
			{/each}
			{#each pages as page, i}
				<button
					class="navbar-menu-item"
					on:click={() => needToWorkOn(page)}
					style="--delay-index: {i + screens.length}"
					type="button"
				>
					{page}↗
				</button>
			{/each}
		</div>

		<div class="navbar-icons">
			<button
				class="navbar-icon"
				on:click={() => window.open('https://www.facebook.com/sunrinana/', '_blank')}
				type="button"
				aria-label="Facebook"
			>
				<Fa icon={faFacebook} color="black" />
			</button>
			<button
				class="navbar-icon"
				on:click={() => window.open('https://instagram.com/sunrin_ana', '_blank')}
				type="button"
				aria-label="Instagram"
			>
				<Fa icon={faInstagram} color="black" />
			</button>
			<button
				class="navbar-icon"
				on:click={() => window.open('https://github.com/sunrin-ana', '_blank')}
				type="button"
				aria-label="Github"
			>
				<Fa icon={faGithub} color="black" />
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes openMenuItem {
		0% {
			opacity: 0;
			transform: translateY(-50%);
		}
		20% {
			opacity: 1;
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.navbar-container {
		position: fixed;
		top: 0;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 1.5rem 3rem;
		z-index: 100;
        background-color: #f9f9f9;
	}

	.logo-image {
		width: 2rem;
		height: 2rem;
		transition: transform 0.25s ease-out;
	}
	.logo-button {
		border: 0;
		background: transparent;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.logo-button:hover .logo-image {
		transform: scale(1.2);
		transition: transform 0.25s ease-out;
	}

	.navbar-menu {
		display: flex;
		flex-direction: row;
		margin-left: 3rem;
		width: calc(100% - 13rem);
		align-items: center;
        background-color: #f9f9f9;
	}

	.navbar-menu-items {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.navbar-menu-item {
		cursor: pointer;
		position: relative;
		color: rgb(109, 109, 109);
		user-select: none;
		height: fit-content;
		border: 0;
		background: transparent;
		padding: 0;
		font: inherit;
	}
	.navbar-menu-item:hover {
		color: black;
	}
	.navbar-menu-item::after {
		content: '';
		position: absolute;
		width: 100%;
		transform: scaleX(0);
		height: 2px;
		bottom: -2px;
		left: 0;
		background-color: black;
		transform-origin: bottom left;
		transition: transform 0.5s ease-out;
	}
	.navbar-menu-item:hover::after {
		transform: scaleX(1);
		transform-origin: bottom left;
		transition: transform 0.5s cubic-bezier(0.25, 0, 0, 1);
	}

	.navbar-icons {
		display: flex;
		flex-direction: row;
		margin-left: auto;
		gap: 0.75rem;
	}

	.navbar-icon {
		cursor: pointer;
		font-size: 1.5rem;
		transition: transform 0.25s ease-out;
		border: 0;
		background: transparent;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.navbar-icon:hover {
		transform: scale(1.2);
		transition: transform 0.25s ease-out;
	}

	.hamburger-icon {
		display: none;
		cursor: pointer;
		user-select: none;
		border: 0;
		background: transparent;
		padding: 0;
	}

	/* Responsive Mobile Styles */
	@media (max-width: 768px) {
		.navbar-container {
			padding: 1rem 0;
			width: 100%;
			justify-content: space-between;
		}
		.logo-image {
			margin-left: 1rem;
			transform: scale(1.1);
		}

		.navbar-menu {
			flex-direction: column;
			align-items: flex-start;
			position: absolute;
			top: 4rem;
			width: 100%;
			overflow: hidden;
			padding: 0;
			margin: 0 auto;

			height: 0;
			opacity: 0;
			transition:
				height 0.5s ease-out,
				opacity 0.1s ease-out 0.4s;
		}
		.navbar-menu.open {
			height: 100vh;
			opacity: 1;
			transition:
				height 0.5s ease-out,
				opacity 0.1s ease-out 0s;
		}

		.navbar-menu-items {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.navbar-menu-item {
			margin: 0.5rem 1rem;
			width: fit-content;
			opacity: 0; /* Hidden by default when menu is closed */
		}

		.navbar-menu.open .navbar-menu-item {
			opacity: 1;
			animation: openMenuItem 0.5s ease-out forwards;
			animation-delay: calc(0.5s + var(--delay-index) * 0.1s);
			transition: opacity 0.5s ease-out;
			transition-delay: calc(0.5s + var(--delay-index) * 0.1s);
		}

		.navbar-icons {
			justify-content: flex-start;
			margin: 0.5rem 1rem;
			opacity: 0; /* Hidden by default when menu is closed */
		}

		.navbar-menu.open .navbar-icons {
			opacity: 1;
			animation: openMenuItem 0.5s ease-out forwards;
			animation-delay: 1.1s;
			transition: opacity 0.5s ease-out 1.1s;
		}

		.navbar-icon {
			font-size: 2rem;
		}

		.hamburger-icon {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-right: 1rem;
			transform: rotate(0deg);
			transition: transform 0.5s ease-out;
		}
		.hamburger-icon.open {
			transform: rotate(-90deg);
		}
	}
</style>
