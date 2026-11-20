import { SITE_URL } from '$lib/seo.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.protocol === 'http:' && event.url.host === 'ana.st') {
		return new Response(null, {
			status: 308,
			headers: { location: SITE_URL + event.url.pathname + event.url.search }
		});
	}

	return resolve(event);
}
