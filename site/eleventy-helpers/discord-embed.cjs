/**
 * The Discord link preview of the home page: a component embed (a layout of
 * Discord components shown instead of the usual Open Graph card) plus the
 * Open Graph tags Discord falls back to.
 * https://discord.com/developers/docs/link-previews/component-embeds
 *
 * Used in two places, so both always send the same preview:
 * - at build time, by the `discordEmbedHead` filter (default.html, pages with
 *   `discordEmbed: true`): the preview in the page's own language;
 * - at request time, by proxy.js, when Discord fetches a home page with a query
 *   string: `?lang=` picks the language, and every button keeps the query
 *   string of the shared link (`?lang=fr&ref=x` → `/install?lang=fr&ref=x`).
 *
 * Text comes from `discordEmbed` in site/_data/i18n/<locale>.json. Required
 * (not read from disk) so Vercel bundles the JSON with the proxy.
 */

const locales = require('../site/_data/locales.json');

const dictionaries = {
  en: require('../site/_data/i18n/en.json'),
  fr: require('../site/_data/i18n/fr.json'),
  es: require('../site/_data/i18n/es.json'),
  'pt-BR': require('../site/_data/i18n/pt-BR.json'),
  de: require('../site/_data/i18n/de.json'),
};

const ORIGIN = 'https://moddy.app';
const DEFAULT_LOCALE = 'en';
const ACCENT_COLOR = 0x0075ff;
const MODDY_EMOJI = '<:ModdyIcon:1515765478411206666>';

// Discord rejects a payload over 3,000 bytes and a button URL over 512
// characters; past either, the preview falls back to the Open Graph card.
const MAX_PAYLOAD_BYTES = 3000;
const MAX_URL_LENGTH = 512;

const BUTTONS = [
  {key: 'add', url: `${ORIGIN}/install`},
  {key: 'website', url: ORIGIN},
  {key: 'support', url: `${ORIGIN}/support`},
  {key: 'dashboard', url: 'https://dashboard.moddy.app'},
];

function strings(code) {
  const dict = dictionaries[code];
  if (!dict) throw new Error(`discord-embed: unknown locale "${code}"`);
  const embed = dict.discordEmbed || {};
  for (const key of ['intro', 'setup', ...BUTTONS.map((button) => button.key)]) {
    if (typeof embed[key] !== 'string') {
      throw new Error(`discord-embed: ${code} is missing discordEmbed.${key}`);
    }
  }
  return {...embed, description: dict.home.hero.text};
}

/**
 * The locale a `lang` value asks for (`fr`, `pt-br`, `pt_BR`, `pt`, `de-AT`…),
 * or `fallback` when it names none of the site's languages.
 */
function resolveLocale(lang, fallback = DEFAULT_LOCALE) {
  if (!lang) return fallback;
  const wanted = String(lang).trim().toLowerCase().replace(/_/g, '-');
  const exact = locales.find((locale) => locale.code.toLowerCase() === wanted);
  if (exact) return exact.code;
  const base = wanted.split('-')[0];
  const sameBase = locales.find((locale) => locale.code.toLowerCase().split('-')[0] === base);
  return sameBase ? sameBase.code : fallback;
}

/** The locale whose home page lives at `pathname` (`/`, `/fr`, `/pt-br/`…). */
function localeForPath(pathname) {
  const prefix = pathname.replace(/\/(index\.html)?$/, '').toLowerCase();
  const locale = locales.find((l) => l.prefix.toLowerCase() === prefix);
  return locale ? locale.code : null;
}

function withParams(url, params) {
  const target = new URL(url);
  for (const [key, value] of params) target.searchParams.append(key, value);
  return target.href;
}

function buildPayload(code, params) {
  const text = strings(code);
  return {
    component: {
      type: 17,
      accent_color: ACCENT_COLOR,
      spoiler: false,
      components: [
        {type: 10, content: `## ${MODDY_EMOJI} Moddy\n${text.intro}`},
        {type: 10, content: text.setup},
        {
          type: 1,
          components: BUTTONS.map((button) => ({
            type: 2,
            style: 5,
            label: text[button.key],
            url: withParams(button.url, params),
          })),
        },
      ],
    },
  };
}

// Safe inside <script>: no `<` can close the element early.
function serialize(payload) {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

function fits(payload, json) {
  const urls = payload.component.components[2].components.map((button) => button.url);
  return (
    Buffer.byteLength(json, 'utf8') <= MAX_PAYLOAD_BYTES &&
    urls.every((url) => url.length <= MAX_URL_LENGTH)
  );
}

/**
 * The component embed JSON, ready for the inline <script>. When the query
 * string makes it too long for Discord, the buttons keep only `lang`, then
 * nothing, rather than losing the whole preview.
 */
function homeEmbedJson(code, params = new URLSearchParams()) {
  const lang = params.get('lang');
  const attempts = [params, new URLSearchParams(lang ? {lang} : {}), new URLSearchParams()];
  let json = '';
  for (const attempt of attempts) {
    const payload = buildPayload(code, attempt);
    json = serialize(payload);
    if (fits(payload, json)) return json;
  }
  throw new Error(`discord-embed: the ${code} payload is over ${MAX_PAYLOAD_BYTES} bytes`);
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * The <head> tags of the preview: Open Graph fallback, then the component
 * embed. `code` is the language of the text, `pageUrl` the page's address.
 */
function homeEmbedHead(code, pageUrl, params = new URLSearchParams()) {
  const text = strings(code);
  const meta = [
    ['og:type', 'website'],
    ['og:site_name', 'Moddy'],
    ['og:title', 'Moddy'],
    ['og:description', text.description],
    ['og:url', pageUrl],
    ['og:image', `${ORIGIN}/images/light.png`],
  ];
  return [
    ...meta.map(
      ([property, content]) =>
        `<meta property="${property}" content="${escapeAttribute(content)}" />`,
    ),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<script id="discord:component-embed" type="application/json">${homeEmbedJson(code, params)}</script>`,
  ].join('\n');
}

/** A home page URL for a locale: `https://moddy.app/fr/`. */
function homeUrl(code) {
  const locale = locales.find((l) => l.code === code);
  return `${ORIGIN}${locale ? locale.prefix : ''}/`;
}

/**
 * The page proxy.js sends Discord for a home page with a query string. Only
 * the <head> matters to Discord, which does not run scripts or show the body.
 */
function homePreviewPage(pathname, params) {
  const pageLocale = localeForPath(pathname) || DEFAULT_LOCALE;
  const code = resolveLocale(params.get('lang'), pageLocale);
  const locale = locales.find((l) => l.code === code);
  return [
    '<!DOCTYPE html>',
    `<html lang="${escapeAttribute(locale.lang)}">`,
    '<head>',
    '<meta charset="utf-8" />',
    '<title>Moddy</title>',
    homeEmbedHead(code, homeUrl(pageLocale), params),
    '</head>',
    '<body></body>',
    '</html>',
  ].join('\n');
}

module.exports = {
  resolveLocale,
  localeForPath,
  homeEmbedJson,
  homeEmbedHead,
  homeUrl,
  homePreviewPage,
};
