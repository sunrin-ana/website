/**
 * Canonical URL helpers.
 *
 * Search Console reported "Duplicate, Google chose different canonical than user"
 * and "Duplicate without user-selected canonical" because the site never declared
 * a canonical URL. The same content is reachable through:
 *
 *   - http://ana.st/...            (plain HTTP still answers 200)
 *   - https://ana.st/about/        (trailing slash)
 *   - https://ana.st/about?utm=... (tracking/filter query strings)
 *   - the *.workers.dev deployment URL
 *
 * Every page now points at one normalised address on the production host, so all
 * of those variants consolidate into a single indexed URL.
 */

/** Production origin. Previews and aliases canonicalise back to this. */
export const SITE_URL = 'https://ana.st';

/**
 * Absolute, normalised canonical URL for a page.
 * Query strings and hashes are dropped, duplicate slashes collapse, and the
 * trailing slash is removed (except for the root).
 *
 * @param {URL | string} input
 * @returns {string}
 */
export function canonicalUrl(input) {
	const url = typeof input === 'string' ? new URL(input, SITE_URL) : input;
	const path = url.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
	return path ? SITE_URL + path : `${SITE_URL}/`;
}
