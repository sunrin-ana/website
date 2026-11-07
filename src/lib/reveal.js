/**
 * Svelte action: adds `.in` to the node when it scrolls into view.
 * Use with the global `.reveal` class.
 * @param {HTMLElement} node
 */
export function reveal(node) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('in');
		return {};
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.classList.add('in');
					io.unobserve(node);
				}
			}
		},
		{ rootMargin: '0px 0px -10% 0px' }
	);
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
