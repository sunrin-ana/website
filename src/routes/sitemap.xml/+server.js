import { archives } from '$lib/archives.js';
import { SITE_URL } from '$lib/seo.js';

// Emitted as a static file at build time (Cloudflare serves /sitemap.xml directly).
export const prerender = true;

const pages = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/about', changefreq: 'monthly', priority: '0.8' },
	{ path: '/archives', changefreq: 'weekly', priority: '0.9' },
	{ path: '/curriculum', changefreq: 'monthly', priority: '0.8' }
];

export function GET() {
	const urls = [
		...pages,
		...archives.map((item) => ({
			path: `/archives/${item.id}`,
			changefreq: 'monthly',
			priority: '0.6'
		}))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ path, changefreq, priority }) => `	<url>
		<loc>${path === '/' ? `${SITE_URL}/` : SITE_URL + path}</loc>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
}
