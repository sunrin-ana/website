<script lang="ts">
	// @ts-nocheck — the installed three.js typings lag the runtime API
	// Interactive "region" globe, modelled on cloudflare.com's Region: Earth section:
	// instanced rounded-square land dots on a fog-faded sphere, a light graticule,
	// HTML pins that pop in when they face the camera, arcs that grow between
	// linked pins, and bracketed captions that follow their pin.
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import earthLandMask from '$lib/earth-land-mask.json';
	import { pois, links } from '$lib/globe-data.js';
	import { cssColor, onThemeChange } from '$lib/theme.js';

	// colours default to the current theme (see theme.js); pass any of these to pin one
	let {
		color,
		arcColor,
		lineColor,
		background
	}: { color?: string; arcColor?: string; lineColor?: string; background?: string } = $props();

	const LOGO =
		'M52 52L31.871 0H20.129L0 52H10.9032L18.8923 28.862L26.605 52L52 52ZM39.6006 47.6667L26.8387 10.7059H25.1613L21.2164 22.131L29.7283 47.6667H39.6006Z';

	let wrap: HTMLDivElement;
	let host: HTMLDivElement;
	let pinRoots: HTMLDivElement[] = $state([]);
	let pins: HTMLDivElement[] = $state([]);
	let capRoots: HTMLDivElement[] = $state([]);
	let caps: HTMLDivElement[] = $state([]);
	let capTexts: HTMLDivElement[] = $state([]);
	let ready = $state(false);

	const items = pois.map((p, i) => ({ ...p, i }));
	const captioned = items.filter((p) => p.caption);
	const isFilled = (t: string) => t !== 'user';

	onMount(() => {
		const D2R = Math.PI / 180;
		const R = 0.99;
		const mobileQ = matchMedia('(max-width: 767px)');
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let mobile = mobileQ.matches;

		// Same lat/lon → xyz convention for dots, pins and arcs.
		const wc = (lat: number, lon: number, r: number) => {
			const n = (90 - lat) * D2R,
				i = (lon + 180) * D2R;
			return new THREE.Vector3(-r * Math.sin(n) * Math.cos(i), r * Math.cos(n), r * Math.sin(n) * Math.sin(i));
		};

		/* ---------- land mask ---------- */
		const MW = earthLandMask.width,
			MH = earthLandMask.height;
		const raw = atob(earthLandMask.data);
		const bits = new Uint8Array(raw.length);
		for (let k = 0; k < raw.length; k++) bits[k] = raw.charCodeAt(k);
		const isLand = (lat: number, lon: number) => {
			const x = Math.floor((((((lon + 180) % 360) + 360) % 360) / 360) * MW) % MW;
			const y = Math.min(MH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MH)));
			const idx = y * MW + x;
			return ((bits[idx >> 3] >> (idx & 7)) & 1) === 1;
		};

		/* ---------- renderer / scene ---------- */
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
		renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
		renderer.setClearColor(0x000000, 0);
		host.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const fog = new THREE.Fog('#ffffff', 2, 4);
		scene.fog = fog;

		const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);

		const globe = new THREE.Group();
		globe.scale.setScalar(1.2);
		globe.rotation.set(0, 0, -0.25);
		globe.position.set(0, -0.3, 0);
		scene.add(globe);

		/* ---------- land dots: fibonacci sphere, land only ---------- */
		const N = 50000;
		const golden = Math.PI * 2 * ((1 + Math.sqrt(5)) / 2);
		const pts: THREE.Vector3[] = [];
		for (let k = 0; k < N; k++) {
			const phi = Math.acos(1 - (2 * k) / N);
			const th = golden * k;
			const v = new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi));
			const lat = Math.asin(v.y) / D2R;
			let lon = Math.atan2(v.z, -v.x) / D2R - 180;
			if (lon < -180) lon += 360;
			if (isLand(lat, lon)) pts.push(v.multiplyScalar(R));
		}

		const S = 0.006,
			h = S / 2,
			c = S * 0.167;
		const sq = new THREE.Shape();
		sq.moveTo(-h + c, -h);
		sq.lineTo(h - c, -h);
		sq.quadraticCurveTo(h, -h, h, -h + c);
		sq.lineTo(h, h - c);
		sq.quadraticCurveTo(h, h, h - c, h);
		sq.lineTo(-h + c, h);
		sq.quadraticCurveTo(-h, h, -h, h - c);
		sq.lineTo(-h, -h + c);
		sq.quadraticCurveTo(-h, -h, -h + c, -h);
		const dotGeo = new THREE.ShapeGeometry(sq, 2);
		const dotMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
		const dots = new THREE.InstancedMesh(dotGeo, dotMat, pts.length);
		const dummy = new THREE.Object3D();
		pts.forEach((p, k) => {
			dummy.position.copy(p);
			dummy.lookAt(0, 0, 0);
			dummy.updateMatrix();
			dots.setMatrixAt(k, dummy.matrix);
		});
		dots.instanceMatrix.needsUpdate = true;
		globe.add(dots);

		/* ---------- graticule ---------- */
		const lineMat = new THREE.LineBasicMaterial();
		const lineGeos: THREE.BufferGeometry[] = [];
		const addLine = (arr: THREE.Vector3[]) => {
			const g = new THREE.BufferGeometry().setFromPoints(arr);
			lineGeos.push(g);
			globe.add(new THREE.Line(g, lineMat));
		};
		for (let b = 0; b < 24; b++) {
			const lon = -180 + (360 / 24) * b;
			const a: THREE.Vector3[] = [];
			for (let lat = -90; lat <= 90; lat++) a.push(wc(lat, lon, R));
			addLine(a);
		}
		const parallel = (lat: number) => {
			const a: THREE.Vector3[] = [];
			for (let lon = -180; lon <= 180; lon++) a.push(wc(lat, lon, R));
			addLine(a);
		};
		parallel(0);
		for (let b = 0; b < 23; b++) {
			const lat = -90 + (180 / 24) * (b + 1);
			if (Math.abs(lat) >= 5) parallel(lat);
		}

		/* ---------- pins: local position + normal ---------- */
		const local = items.map((p) => wc(p.lat, p.lon, R));
		const normals = local.map((v) => v.clone().normalize());

		/* ---------- arcs ---------- */
		type Arc = { mesh: THREE.Mesh; a: number; b: number; s: number; e: number; on: boolean };
		const arcs: Arc[] = [];
		let arcTint = '#334882';
		const arcMat = () =>
			new THREE.MeshBasicMaterial({ color: arcTint, transparent: true, opacity: 0, depthWrite: false });
		const makeArc = (ai: number, bi: number) => {
			const u = wc(items[ai].lat, items[ai].lon, 1),
				v = wc(items[bi].lat, items[bi].lon, 1);
			const arr: THREE.Vector3[] = [];
			for (let k = 0; k <= 20; k++) {
				const t = k / 20;
				const lift = t - t * t;
				const p = u.clone().multiplyScalar(1 - t).add(v.clone().multiplyScalar(t));
				p.add(p.clone().normalize().multiplyScalar(lift * 0.3));
				arr.push(p);
			}
			const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arr), 64, 0.002, 6, false);
			geo.setDrawRange(0, 0);
			const mesh = new THREE.Mesh(geo, arcMat());
			mesh.renderOrder = 5000;
			mesh.visible = false;
			globe.add(mesh);
			arcs.push({ mesh, a: ai, b: bi, s: 0, e: 0, on: false });
		};
		for (const [infra, groups] of Object.entries(links)) {
			const heads = items.filter((p) => p.group === infra && (p.iconType === 'server' || p.iconType === 'hub'));
			const stores = items.filter((p) => p.group === infra && p.iconType === 'db');
			for (const g of groups) {
				const users = items.filter((p) => p.group === g && p.iconType === 'user');
				heads.forEach((hd) => users.forEach((us) => makeArc(us.i, hd.i)));
			}
			heads.forEach((hd) => stores.forEach((st) => makeArc(hd.i, st.i)));
		}

		/* ---------- layout ---------- */
		let W = 0,
			H = 0;
		function resize() {
			mobile = mobileQ.matches;
			W = host.clientWidth;
			H = host.clientHeight;
			renderer.setSize(W, H, false);
			camera.aspect = W / Math.max(1, H);
			fog.near = mobile ? 3.25 : 2;
			fog.far = mobile ? 6 : 4;
			if (camera.position.lengthSq() > 0) camera.position.setLength(Math.hypot(0.5, mobile ? 4 : 2.75));
			camera.updateProjectionMatrix();
		}

		// Start with Korea just right of centre; auto-rotate carries it across.
		const dist = Math.hypot(0.5, mobile ? 4 : 2.75);
		const startLon = 112;
		const dir = wc(0, startLon, 1);
		camera.position.set(dir.x * dist, 0, dir.z * dist);
		camera.lookAt(0, 0, 0);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.minPolarAngle = Math.PI / 2;
		controls.maxPolarAngle = Math.PI / 2;
		controls.autoRotate = !reduce;
		controls.autoRotateSpeed = 0.3;
		renderer.domElement.style.touchAction = 'pan-y';

		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(host);

		/* ---------- per-frame overlay ---------- */
		const visible = items.map(() => false);
		const capState = new Map<number, { shown: boolean; start: number; grown: boolean }>();
		const tmp = new THREE.Vector3(),
			camPos = new THREE.Vector3(),
			camRight = new THREE.Vector3(),
			centre = new THREE.Vector3(),
			toCam = new THREE.Vector3(),
			nrm = new THREE.Vector3();
		const lastQ = new THREE.Quaternion();
		let motion = 0;
		const ease = (t: number) => 1 - (1 - t) ** 3;
		const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

		const clock = new THREE.Clock();
		let raf = 0;
		let onScreen = true;

		function frame() {
			raf = requestAnimationFrame(frame);
			if (!onScreen) {
				clock.getDelta();
				return;
			}
			const dt = Math.min(0.05, clock.getDelta());
			const t = clock.elapsedTime;
			controls.update(dt);

			// pins hide while the user spins the globe quickly
			motion = motion * 0.7 + camera.quaternion.angleTo(lastQ) * 0.3;
			lastQ.copy(camera.quaternion);
			const fast = motion > 0.05;

			globe.updateMatrixWorld();
			camera.updateMatrixWorld();
			camera.getWorldPosition(camPos);
			globe.getWorldPosition(centre);
			camRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();

			// 1. which pins face the camera (with hysteresis)
			items.forEach((p, k) => {
				tmp.copy(local[k]);
				globe.localToWorld(tmp);
				nrm.copy(tmp).sub(centre).normalize();
				toCam.copy(camPos).sub(tmp).normalize();
				const d = nrm.dot(toCam);
				visible[k] = (visible[k] ? d > 0.02 : d > 0.12) && !fast;
			});
			const liveUsers = new Set(items.filter((p, k) => p.iconType === 'user' && visible[k]).map((p) => p.group));
			const liveInfra = new Set(
				Object.entries(links)
					.filter(([, gs]) => gs.some((g) => liveUsers.has(g)))
					.map(([inf]) => inf)
			);
			const shown = (k: number) => {
				const p = items[k];
				if (!visible[k]) return false;
				if ((p.iconType === 'server' || p.iconType === 'db') && p.group) return liveInfra.has(p.group);
				return true;
			};

			// 2. place pins + captions
			const rect = renderer.domElement.getBoundingClientRect();
			items.forEach((p, k) => {
				tmp.copy(local[k]);
				globe.localToWorld(tmp);
				const right = toCam.copy(tmp).sub(camPos).dot(camRight) > 0;
				tmp.project(camera);
				const x = (tmp.x * 0.5 + 0.5) * rect.width;
				const y = (-tmp.y * 0.5 + 0.5) * rect.height;
				const on = shown(k);

				const root = pinRoots[k],
					pin = pins[k];
				if (root) root.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
				if (pin) {
					pin.style.opacity = on ? '1' : '0';
					pin.style.transform = `translate(-50%, -50%) scale(${on ? 1 : 0})`;
				}

				if (!p.caption) return;
				const ci = captioned.findIndex((q) => q.i === k);
				const cr = capRoots[ci],
					cap = caps[ci],
					txt = capTexts[ci];
				if (!cr || !cap) return;
				cr.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

				const high = normals[k].y > 0.5;
				const baseY = high ? (mobile ? 160 : 100) : mobile ? -200 : -160;
				const bob = reduce ? 0 : Math.sin(t * 0.6 + p.lat + p.lon) * 6;
				const dy = Math.max(mobile ? -80 : -60, Math.min(mobile ? 180 : 120, baseY + bob));
				const showCap = on && (mobile || (p.captionSide === 'right' && right) || (p.captionSide === 'left' && !right));
				const toRight = mobile ? p.captionSide === 'right' : right;
				const dx = toRight ? (mobile ? 84 : 92) : mobile ? -112 : -280;

				const st = capState.get(k) ?? { shown: false, start: 0, grown: false };
				if (showCap && !st.shown) {
					st.start = t;
					st.grown = false;
					cap.style.transformOrigin = `${high ? 'top' : 'bottom'} ${toRight ? 'left' : 'right'}`;
					if (txt) txt.style.opacity = '0';
				}
				st.shown = showCap;
				capState.set(k, st);

				if (!showCap) {
					cap.style.opacity = '0';
					cap.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
					return;
				}
				let s = 1;
				if (!st.grown) {
					const g = clamp01((t - st.start) / 0.2);
					s = ease(g);
					if (g >= 1) {
						st.grown = true;
						if (txt) txt.style.opacity = '1';
					}
				}
				cap.style.opacity = '1';
				cap.style.transform = `translate(${dx}px, ${dy}px) scale(${s.toFixed(3)})`;
			});

			// 3. arcs grow while both ends are shown, retract otherwise
			for (const a of arcs) {
				const on = shown(a.a) && shown(a.b);
				if (on) {
					if (!a.on && a.e >= 1 && a.s > 0) {
						a.s = 0;
						a.e = 0;
					}
					a.s = clamp01(a.s - dt / 1.5);
					a.e = clamp01(a.e + dt / 1.5);
				} else {
					a.s = clamp01(Math.min(a.e, a.s + dt / 0.55));
					if (a.s >= a.e) {
						a.s = 0;
						a.e = 0;
					}
				}
				a.on = on;
				const E0 = ease(a.s),
					E1 = ease(a.e);
				const span = Math.max(0, E1 - E0);
				const geo = a.mesh.geometry as THREE.BufferGeometry;
				const C = geo.index?.count ?? 0;
				const from = Math.floor((C * E0) / 3) * 3;
				const to = Math.floor((C * E1) / 3) * 3;
				const count = span <= 0 ? 0 : Math.max(6, to - from);
				geo.setDrawRange(from, count);
				(a.mesh.material as THREE.MeshBasicMaterial).opacity = span * 0.8;
				a.mesh.visible = count > 0;
			}

			renderer.render(scene, camera);
		}
		raf = requestAnimationFrame(frame);
		requestAnimationFrame(() => requestAnimationFrame(() => (ready = true)));

		const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
		io.observe(wrap);
		const onMQ = () => resize();
		mobileQ.addEventListener('change', onMQ);

		/* ---------- theme ---------- */
		const offTheme = onThemeChange(() => {
			dotMat.color.set(color ?? cssColor('var(--brand)'));
			arcTint = arcColor ?? cssColor('var(--accent-2)');
			arcs.forEach((a) => (a.mesh.material as THREE.MeshBasicMaterial).color.set(arcTint));
			lineMat.color.set(lineColor ?? cssColor('color-mix(in srgb, var(--line) 75%, var(--surface))'));
			fog.color.set(background ?? cssColor('var(--surface)'));
		});

		return () => {
			offTheme();
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			mobileQ.removeEventListener('change', onMQ);
			controls.dispose();
			dotGeo.dispose();
			dotMat.dispose();
			lineMat.dispose();
			lineGeos.forEach((g) => g.dispose());
			arcs.forEach((a) => {
				a.mesh.geometry.dispose();
				(a.mesh.material as THREE.Material).dispose();
			});
			renderer.dispose();
			renderer.domElement.remove();
		};
	});
</script>

<div class="region" class:ready bind:this={wrap} style={color ? `--c:${color}` : undefined}>
	<div class="gl" bind:this={host}></div>

	<div class="layer pins" aria-hidden="true">
		{#each items as p, k}
			<div class="anchor" bind:this={pinRoots[k]}>
				<div class="pin" class:filled={isFilled(p.iconType)} bind:this={pins[k]}>
					{#if p.iconType === 'hub'}
						<svg viewBox="0 0 52 52" class="logo"><path fill-rule="evenodd" clip-rule="evenodd" d={LOGO} fill="currentColor" /></svg>
					{:else if p.iconType === 'server'}
						<svg viewBox="0 0 24 24"><rect x="4" y="4.5" width="16" height="6" rx="1.5" /><rect x="4" y="13.5" width="16" height="6" rx="1.5" /><path d="M7.5 7.5h.01M7.5 16.5h.01" /></svg>
					{:else if p.iconType === 'db'}
						<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /></svg>
					{:else if p.iconType === 'spark'}
						<svg viewBox="0 0 24 24"><path d="M12 3.5l1.9 5.4 5.6 1.6-5.6 1.6L12 17.5l-1.9-5.4-5.6-1.6 5.6-1.6z" /><path d="M18.5 16.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" /></svg>
					{:else}
						<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5" /><path d="M5.5 19.5c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5" /></svg>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="layer captions" aria-hidden="true">
		{#each captioned as p, ci}
			<div class="anchor" bind:this={capRoots[ci]}>
				<div class="cap" class:has-value={!!p.value} bind:this={caps[ci]}>
					<div class="cap-text" bind:this={capTexts[ci]}>
						{#if p.value}<h6>{p.value}</h6>{/if}
						<p>{p.caption}</p>
					</div>
					<span class="br tl-h"></span><span class="br tl-v"></span>
					<span class="br tr-h"></span><span class="br tr-v"></span>
					<span class="br bl-h"></span><span class="br bl-v"></span>
					<span class="br br-h"></span><span class="br br-v"></span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.region {
		--c: var(--brand);
		position: relative;
		width: 100%;
		height: 500px;
		overflow: hidden;
		opacity: 0;
		transform: scale(0.97);
		transition:
			opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.region.ready {
		opacity: 1;
		transform: none;
	}
	.gl {
		position: absolute;
		inset: 0;
	}
	.gl :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
		cursor: grab;
	}
	.gl :global(canvas:active) {
		cursor: grabbing;
	}
	.layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.pins {
		z-index: 10;
	}
	.captions {
		z-index: 20;
	}
	.anchor {
		position: absolute;
		left: 0;
		top: 0;
		transform: translate3d(-9999px, -9999px, 0);
	}

	/* pins */
	.pin {
		width: 48px;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 50%;
		border: 1px solid var(--c);
		background: color-mix(in srgb, var(--surface) 90%, transparent);
		color: var(--c);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		opacity: 0;
		transform: translate(-50%, -50%) scale(0);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}
	.pin.filled {
		border-color: var(--surface);
		background: color-mix(in srgb, var(--c) 90%, transparent);
		color: var(--on-brand);
	}
	.pin svg {
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.pin svg.logo {
		width: 20px;
		height: 20px;
		stroke: none;
	}

	/* captions */
	.cap {
		position: absolute;
		left: 0;
		top: 0;
		width: 240px;
		padding: 12px;
		border: 1px dashed var(--c);
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		opacity: 0;
		transform: scale(0);
		will-change: transform;
	}
	.cap.has-value {
		padding: 8px 12px;
	}
	.cap-text {
		opacity: 0;
		transition: opacity 0.2s ease-out;
		user-select: none;
	}
	.cap h6 {
		margin: 0 0 2px;
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.4;
		color: var(--ink);
	}
	.cap p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.45;
		color: color-mix(in srgb, var(--ink) 70%, transparent);
	}
	.br {
		position: absolute;
		background: var(--c);
	}
	.tl-h,
	.tr-h,
	.bl-h,
	.br-h {
		width: 16px;
		height: 2px;
	}
	.tl-v,
	.tr-v,
	.bl-v,
	.br-v {
		width: 2px;
		height: 16px;
	}
	.tl-h,
	.tl-v {
		left: -1.5px;
		top: -1.5px;
	}
	.tr-h,
	.tr-v {
		right: -1.5px;
		top: -1.5px;
	}
	.bl-h,
	.bl-v {
		left: -1.5px;
		bottom: -1.5px;
	}
	.br-h,
	.br-v {
		right: -1.5px;
		bottom: -1.5px;
	}

	@media (max-width: 767px) {
		.region {
			height: 420px;
		}
		.pin {
			width: 40px;
		}
		.pin svg {
			width: 20px;
			height: 20px;
		}
		.cap {
			width: 200px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.region {
			transition: none;
			transform: none;
		}
	}
</style>
