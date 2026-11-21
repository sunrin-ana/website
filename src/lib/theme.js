// Theme helpers for canvas/WebGL code, which can't read CSS custom properties directly.

/** localStorage key + window event shared with the pre-paint script in app.html. */
const THEME_KEY = 'ana-theme';
export const THEME_EVENT = 'ana:themechange';

/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

/** @returns {'light' | 'dark'} */
export function getTheme() {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Keep the mobile browser chrome in step with the page. @param {'light' | 'dark'} theme */
function syncThemeColor(theme) {
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) meta.setAttribute('content', theme === 'dark' ? '#121318' : '#ffffff');
}

/**
 * Apply a theme and remember the choice.
 * @param {'light' | 'dark'} theme
 */
export function setTheme(theme) {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		// storage disabled — the theme still applies for this page
	}
	syncThemeColor(theme);
	window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

export function toggleTheme() {
	setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

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
 * Call `fn` now and whenever the theme is toggled (or the OS theme changes while
 * no explicit choice is stored). Returns a cleanup.
 * @param {() => void} fn
 */
export function onThemeChange(fn) {
	let raf = 0;
	const run = () => {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => fn());
	};
	window.addEventListener(THEME_EVENT, run);
	fn();
	return () => {
		cancelAnimationFrame(raf);
		window.removeEventListener(THEME_EVENT, run);
	};
}
