<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';

	let canvas: HTMLCanvasElement | undefined;
	let animationFrameId = 0;
	let renderer: THREE.WebGLRenderer | undefined;
	let scene: THREE.Scene | undefined;
	let camera: THREE.PerspectiveCamera | undefined;
	let size = 0;
	let mod = 0.5;

	// 나는 싫어요 이거
	const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `;

	const fragmentShader = `
        uniform vec3 uColor;
        uniform vec3 uLightPosition;
        uniform float uSpacing;
        uniform float uDotSize;
        uniform float uFadeStart;
        uniform float uFadeEnd;
        uniform vec2 uResolution;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            // I hate this
            vec3 lightDir = normalize(uLightPosition -vWorldPosition);
            float diffuse = max(0.0, dot(normalize(vNormal), lightDir));
            
            // make ana great
            float fade = smoothstep(uFadeStart, uFadeEnd, vWorldPosition.x);
            diffuse *= fade;

            // grid
            vec2 gridUV = gl_FragCoord.xy/ uResolution.y * uSpacing;
            vec2 gridPos = fract(gridUV);
            float dist = distance(gridPos, vec2(.5));

            // dotdot
            float radius = diffuse * uDotSize;
            float dot = 1.0 - smoothstep(radius - .08, radius, dist);

            if (dot < 0.1) discard;

            gl_FragColor = vec4(uColor, dot);
        }
    `;

	onMount(() => {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true
		});
		renderer.setSize(window.innerWidth*.6, window.innerHeight*.6);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
		renderer.setClearColor(0xf9f9f9,1);

		const uniforms: {
			uColor: THREE.IUniform<THREE.Color>;
			uLightPosition: THREE.IUniform<THREE.Vector3>;
			uSpacing: THREE.IUniform<number>;
			uDotSize: THREE.IUniform<number>;
			uFadeStart: THREE.IUniform<number>;
			uFadeEnd: THREE.IUniform<number>;
			uResolution: THREE.IUniform<THREE.Vector2>;
		} = {
			uColor: { value: new THREE.Color(0x334882) },
			uLightPosition: { value: new THREE.Vector3(-5, -.2, 3) },
			uSpacing: { value: 100.0 },
			uDotSize: { value: .65 },
			uFadeStart: { value: -5.0 },
			uFadeEnd: { value: 1.0 },
			uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
		};

		const shaderMaterial = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			transparent: true,
			depthWrite: true
		});

        const loader = new GLTFLoader();

		loader.load('./ana.gltf', (obj: GLTF) => {
			const model = obj.scene.children[0] as THREE.Mesh;
			model.material = shaderMaterial;
			model.scale.setScalar(2);
			model.scale.z = model.scale.z * .3;

			scene?.add(model);
		});

		// 특검
		const handleResize = () => {
			if (!camera || !renderer) return;
			if(window.innerWidth > 600) mod = .5;
			else mod = .8;

			size = Math.min(window.innerWidth, window.innerHeight)*mod;
			camera.aspect = 1;
			camera.updateProjectionMatrix();
			camera.position.set(0,0,4);

			renderer.setSize(size, size);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			uniforms.uResolution.value.set(size, size);
		};
		window.addEventListener('resize', handleResize);

        handleResize();

        // 마우스 특검
		const handleMouseMove = (e: MouseEvent) => {
			const x = (e.pageX-(window.innerWidth/2))*.005;
			const y = ((window.innerHeight/2)-e.pageY)*.005;
			uniforms.uLightPosition.value.x = x;
			uniforms.uLightPosition.value.y = y;
		};
		window.addEventListener('mousemove', handleMouseMove);

		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);
			if (!renderer || !scene || !camera) return;
			renderer.render(scene, camera);
		};
		animate();

		// 갈아 엎어 그냥
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleMouseMove);
			cancelAnimationFrame(animationFrameId);
			if (renderer) {
				renderer.dispose();
			}
			shaderMaterial.dispose();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		width: 50%;
		height: 50vh;
		display: block;
		outline: none;
	}
</style>
