// Theme helpers for canvas/WebGL code, which can't read CSS custom properties directly.

/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

/**
 * Resolve a CSS colour expression (e.g. 'var(--brand)') to '#rrggbb' in the current theme.
 * @param {string} expr
 * @param {HTMLElement} [el]
 * @returns {string}
 */
export function cssColor(expr, el = document.documentElement) {
	const probe = document.createElement('i');
	probe.style.cssText = `position:absolute;width:0;height:0;color:${expr}`;
	el.appendChild(probe);
	const computed = getComputedStyle(probe).color;
	probe.remove();
	// canvas converts any CSS colour space (oklch, color-mix…) to sRGB for us
	ctx ??= /** @type {CanvasRenderingContext2D} */ (
		Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', {
			willReadFrequently: true
		})
	);
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = '#000';
	ctx.fillStyle = computed;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Call `fn` now and whenever the browser switches between light and dark. Returns a cleanup.
 * @param {() => void} fn
 */
export function onThemeChange(fn) {
	const mq = matchMedia('(prefers-color-scheme: dark)');
	let raf = 0;
	const run = () => {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => fn());
	};
	mq.addEventListener('change', run);
	fn();
	return () => {
		cancelAnimationFrame(raf);
		mq.removeEventListener('change', run);
	};
}
