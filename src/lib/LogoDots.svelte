<script lang="ts">
	// @ts-nocheck — the installed three.js typings lag the runtime API
	// The AnA mark as a printed halftone: round ink dots in the logo's navy,
	// sized by a soft tonal gradient, on a shallow relief so the edges catch a
	// little depth when it leans. Dots near the cursor swell slightly (the
	// original halftone's "light"), and the mark only ever moves a little.
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let { color = '#334882', side = '#26365f', background = '#ffffff' } = $props();

	const LOGO =
		'M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z';

	let wrap: HTMLDivElement;
	let ready = $state(false);

	onMount(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

		/* ---------- sample the mark ---------- */
		const N = 520;
		const off = document.createElement('canvas');
		off.width = off.height = N;
		const o = off.getContext('2d', { willReadFrequently: true })!;
		o.scale(N / 52, N / 52);
		o.fill(new Path2D(LOGO), 'evenodd');
		const px = o.getImageData(0, 0, N, N).data;
		const inside = (u: number, v: number) => {
			if (u < 0 || v < 0 || u >= 52 || v >= 52) return false;
			const x = Math.floor((u / 52) * N),
				y = Math.floor((v / 52) * N);
			return px[(y * N + x) * 4 + 3] > 127;
		};

		const STEP = 0.62; // logo units between dots
		const DEPTH = 3; // shallow relief, logo units
		const S = 1 / 26; // logo units → world (mark spans [-1, 1])
		type Dot = { p: THREE.Vector3; n: THREE.Vector3; side: boolean; tone: number };
		const pts: Dot[] = [];

		for (let v = STEP / 2; v < 52; v += STEP) {
			for (let u = STEP / 2; u < 52; u += STEP) {
				if (!inside(u, v)) continue;
				const x = (u - 26) * S,
					y = -(v - 26) * S;
				// print-like tone: lighter toward the lower left, fuller toward the upper right
				const tone = 0.55 + 0.45 * Math.min(1, Math.max(0, (u / 52) * 0.55 + (1 - v / 52) * 0.45));
				pts.push({ p: new THREE.Vector3(x, y, (DEPTH / 2) * S), n: new THREE.Vector3(0, 0, 1), side: false, tone });
				const l = inside(u - STEP, v),
					r = inside(u + STEP, v),
					t = inside(u, v - STEP),
					b = inside(u, v + STEP);
				if (l && r && t && b) continue;
				const n = new THREE.Vector3((l ? 0 : -1) + (r ? 0 : 1), (t ? 0 : 1) + (b ? 0 : -1), 0);
				if (n.lengthSq() === 0) continue;
				n.normalize();
				for (let z = -DEPTH / 2 + STEP / 2; z < DEPTH / 2; z += STEP) {
					pts.push({ p: new THREE.Vector3(x, y, z * S), n: n.clone(), side: true, tone: 0.9 });
				}
			}
		}

		/* ---------- scene ---------- */
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
		renderer.setClearColor(0x000000, 0);
		wrap.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(background, 5.2, 7.5);
		const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
		camera.position.set(0, 0, 5.4);

		const group = new THREE.Group();
		scene.add(group);

		// round ink dots
		const R = STEP * S * 0.5;
		const geo = new THREE.CircleGeometry(R, 14);
		const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
		const mesh = new THREE.InstancedMesh(geo, mat, pts.length);
		group.add(mesh);

		const cFront = new THREE.Color(color),
			cSide = new THREE.Color(side);
		pts.forEach((d, i) => mesh.setColorAt(i, d.side ? cSide : cFront));
		mesh.instanceColor.needsUpdate = true;

		const dummy = new THREE.Object3D();
		const light = new Float32Array(pts.length);
		function setDot(i: number) {
			const d = pts[i];
			dummy.position.copy(d.p);
			dummy.lookAt(d.p.x + d.n.x, d.p.y + d.n.y, d.p.z + d.n.z);
			dummy.scale.setScalar(Math.min(1, d.tone * 0.82 + light[i] * 0.3));
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		for (let i = 0; i < pts.length; i++) setDot(i);
		mesh.instanceMatrix.needsUpdate = true;

		/* ---------- size ---------- */
		let needsDraw = true;
		function resize() {
			const w = wrap.clientWidth;
			renderer.setSize(w, w, false);
			camera.aspect = 1;
			camera.updateProjectionMatrix();
			needsDraw = true;
		}
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrap);

		/* ---------- pointer ---------- */
		let tx = 0,
			ty = 0,
			lastMove = -10;
		const cursor = new THREE.Vector2(9, 9);
		const onMove = (e: PointerEvent) => {
			const r = wrap.getBoundingClientRect();
			const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
			const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
			tx = Math.max(-1.5, Math.min(1.5, nx));
			ty = Math.max(-1.5, Math.min(1.5, ny));
			cursor.set(nx * 1.3, -ny * 1.3);
			lastMove = clock.elapsedTime;
		};
		window.addEventListener('pointermove', onMove, { passive: true });

		/* ---------- loop ---------- */
		const clock = new THREE.Clock();
		let raf = 0,
			visible = true,
			rx = 0,
			ry = 0;

		function frame() {
			raf = requestAnimationFrame(frame);
			if (!visible) {
				clock.getDelta();
				return;
			}
			clock.getDelta();
			const t = clock.elapsedTime;

			// small, slow lean — never a showy spin
			const idle = t - lastMove > 2.5;
			const gy = reduce ? 0 : idle ? Math.sin(t * 0.4) * 0.07 : tx * 0.16;
			const gx = reduce ? 0 : idle ? Math.sin(t * 0.29) * 0.03 : ty * 0.08;
			const dry = (gy - ry) * 0.04,
				drx = (gx - rx) * 0.04;
			ry += dry;
			rx += drx;
			group.rotation.set(rx, ry, 0);
			const moved = Math.abs(dry) + Math.abs(drx) > 1e-5;

			// halftone light: dots under the cursor swell a little
			const on = idle || reduce ? 0 : 1;
			let dirty = false;
			for (let i = 0; i < pts.length; i++) {
				const d = pts[i];
				const dx = d.p.x - cursor.x,
					dy = d.p.y - cursor.y;
				const target = on * Math.exp(-(dx * dx + dy * dy) / 0.32);
				const v = light[i] + (target - light[i]) * 0.08;
				if (Math.abs(v - light[i]) > 0.003) {
					light[i] = v;
					setDot(i);
					dirty = true;
				}
			}
			if (dirty) mesh.instanceMatrix.needsUpdate = true;

			// only redraw when something actually changed
			if (moved || dirty || needsDraw) {
				renderer.render(scene, camera);
				needsDraw = false;
			}
		}
		raf = requestAnimationFrame(frame);
		requestAnimationFrame(() => (ready = true));

		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
		io.observe(wrap);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			window.removeEventListener('pointermove', onMove);
			geo.dispose();
			mat.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	});
</script>

<div class="logo-dots" class:ready bind:this={wrap} role="img" aria-label="AnA 로고"></div>

<style>
	.logo-dots {
		width: 100%;
		aspect-ratio: 1;
		opacity: 0;
		transition: opacity 0.9s ease;
	}
	.logo-dots.ready {
		opacity: 1;
	}
	.logo-dots :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
	}
	@media (prefers-reduced-motion: reduce) {
		.logo-dots {
			transition: none;
		}
	}
</style>
