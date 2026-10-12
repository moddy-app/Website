/**
 * Vercel Routing Middleware (`proxy` in vercel.json), run on the home pages
 * only (`proxy.matcher` in vercel.json).
 *
 * When Discord fetches a home page with a query string, it gets a preview
 * built from that query string: `?lang=` picks the language of the component
 * embed (English by default on `/`, the page's language on `/fr/` & co.), and
 * every button keeps the query string of the link. Without a query string, or
 * for anyone but Discord, the static page is served as is: it already carries
 * the preview in its own language (eleventy-helpers/discord-embed.cjs).
 *
 * CommonJS on purpose: Vercel loads this file with require(), and package.json
 * has no "type": "module", so ES module syntax here takes the site down.
 */

const discordEmbed = require('./eleventy-helpers/discord-embed.cjs');

// What `next()` from @vercel/functions returns: serve the page as usual.
function next() {
  return new Response(null, {headers: {'x-middleware-next': '1'}});
}

function proxy(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  if (!url.search || !/discordbot/i.test(userAgent)) return next();
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  if (!discordEmbed.localeForPath(url.pathname)) return next();

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

module.exports = proxy;
module.exports.default = proxy;
