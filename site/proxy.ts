/**
 * Vercel Routing Middleware (`proxy` in vercel.json), run on the home pages
 * only.
 *
 * When Discord fetches a home page with a query string, it gets a preview
 * built from that query string: `?lang=` picks the language of the component
 * embed (English by default on `/`, the page's language on `/fr/` & co.), and
 * every button keeps the query string of the link. Without a query string, or
 * for anyone but Discord, the static page is served as is: it already carries
 * the preview in its own language (eleventy-helpers/discord-embed.cjs).
 */

import discordEmbed from './eleventy-helpers/discord-embed.cjs';

export const config = {
  matcher: [
    '/',
    '/fr',
    '/fr/',
    '/es',
    '/es/',
    '/pt-br',
    '/pt-br/',
    '/de',
    '/de/',
  ],
};

export default function proxy(request: Request): Response | undefined {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!url.search || !/discordbot/i.test(userAgent)) return undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') return undefined;
  if (!discordEmbed.localeForPath(url.pathname)) return undefined;

  const html = discordEmbed.homePreviewPage(url.pathname, url.searchParams);
  return new Response(request.method === 'HEAD' ? null : html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Same URL, other content for people: never cache it.
      'cache-control': 'private, no-store',
      vary: 'user-agent',
    },
  });
}
