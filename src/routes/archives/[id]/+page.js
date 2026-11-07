import { error } from '@sveltejs/kit';
import { archives } from '$lib/archives.js';

export const prerender = true;

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return archives.map((a) => ({ id: a.id }));
}

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const i = archives.findIndex((a) => a.id === params.id);
	if (i < 0) error(404, '프로젝트를 찾을 수 없습니다.');
	const n = archives.length;
	return {
		item: archives[i],
		prev: n > 1 ? archives[(i - 1 + n) % n] : null,
		next: n > 1 ? archives[(i + 1) % n] : null
	};
}
