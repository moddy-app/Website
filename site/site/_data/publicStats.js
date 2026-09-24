/**
 * Public numbers shown on the home page, fetched once at build time from
 * api.moddy.app so they are in the HTML on every deployment (the API only
 * answers browsers coming from https://moddy.app, so previews could not
 * fetch them client side). On moddy.app, home-page.ts refreshes them live.
 *
 * Never fails the build: if the API is unreachable, `stats` and `topGuilds`
 * are null / empty and the page falls back to the client-side fetch.
 */

const API = 'https://api.moddy.app';
const ICON_ORIGIN = 'https://cdn.discordapp.com/';

async function getJson(path) {
  try {
    const response = await fetch(API + path, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[publicStats] ${path} unavailable: ${error.message}`);
    return null;
  }
}

function initials(name) {
  return (
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => [...word][0])
      .join('')
      .toUpperCase() || '?'
  );
}

/** A width that looks random but stays the same for a server between
 *  builds (hash of its name), so the marquee has an uneven rhythm. */
function tileWidth(name) {
  let hash = 0;
  for (const char of String(name)) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return 200 + (hash % 5) * 15; // 200 to 260 px
}

module.exports = async function () {
  const [stats, top] = await Promise.all([
    getJson('/public/stats'),
    getJson('/public/stats/top-guilds'),
  ]);

  const topGuilds = ((top && top.guilds) || []).map((guild) => ({
    name: String(guild.name),
    initials: initials(guild.name),
    members: Number(guild.member_count) || 0,
    width: tileWidth(guild.name),
    // Only Discord's CDN, at a size fit for a 36px avatar.
    icon:
      typeof guild.icon_url === 'string' && guild.icon_url.startsWith(ICON_ORIGIN)
        ? guild.icon_url.replace(/size=\d+/, 'size=64')
        : null,
  }));

  return {
    stats:
      stats && stats.guilds
        ? {
            guilds: Number(stats.guilds) || 0,
            users: Number(stats.users) || 0,
            commands: Number(stats.commands_30d) || 0,
            cases: Number(stats.moderation_cases) || 0,
          }
        : null,
    topGuilds,
  };
};
