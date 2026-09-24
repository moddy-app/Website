/**
 * Internationalization for the site.
 *
 * Every user-facing string lives in site/_data/i18n/<locale>.json, and the
 * locales themselves (code, URL prefix, label) in site/_data/locales.json.
 * Pages are rendered once per locale at build time (11ty pagination over
 * `locales`), so there is no client-side flash of untranslated text.
 *
 * The build fails if a locale is missing a key that English has (or has one
 * English does not), or if a template asks for a key that does not exist.
 *
 * Filters:
 * - `t(key, locale, vars)`: the string at `key`, with `{name}` placeholders
 *   replaced from `vars`.
 * - `tObject(key, locale)`: the whole subtree at `key` (e.g. the top bar
 *   labels handed to <top-app-bar> as JSON).
 * - `docsUrl(path, locale)`: a docs.moddy.app link in that language when the
 *   docs have one, English otherwise.
 * - `formatNumber(value, locale, compact)`: a number in the locale's format.
 * - `formatPrice(value, locale)`: a price in euros in the locale's format.
 * - `i18nClient(prefixes)`: `{locale: {flatKey: string}}` for the given key
 *   prefixes, for the few pages that cannot be rendered per locale (404).
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'site', '_data');
const DOCS_ORIGIN = 'https://docs.moddy.app';
const SOURCE_LOCALE = 'en';

const locales = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, 'locales.json'), 'utf8'),
);

const dictionaries = Object.fromEntries(
  locales.map((locale) => [
    locale.code,
    JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'i18n', `${locale.code}.json`), 'utf8'),
    ),
  ]),
);

function flatten(object, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(object)) {
    const flatKey = prefix + key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, flatKey + '.'));
    } else {
      out[flatKey] = value;
    }
  }
  return out;
}

const flat = Object.fromEntries(
  Object.entries(dictionaries).map(([code, dict]) => [code, flatten(dict)]),
);

function checkCompleteness() {
  const reference = Object.keys(flat[SOURCE_LOCALE]);
  const problems = [];
  for (const {code} of locales) {
    const keys = Object.keys(flat[code]);
    const missing = reference.filter((key) => !(key in flat[code]));
    const extra = keys.filter((key) => !(key in flat[SOURCE_LOCALE]));
    if (missing.length) problems.push(`${code} is missing: ${missing.join(', ')}`);
    if (extra.length) problems.push(`${code} has unknown keys: ${extra.join(', ')}`);
  }
  if (problems.length) {
    throw new Error(`i18n dictionaries are out of sync:\n${problems.join('\n')}`);
  }
}

function lookup(key, code) {
  const dict = dictionaries[code];
  if (!dict) {
    throw new Error(`i18n: unknown locale "${code}"`);
  }
  let value = dict;
  for (const part of key.split('.')) {
    value = value == null ? undefined : value[part];
  }
  if (value === undefined) {
    throw new Error(`i18n: missing key "${key}" for locale "${code}"`);
  }
  return value;
}

function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  );
}

module.exports = function (eleventyConfig) {
  checkCompleteness();

  eleventyConfig.addFilter('t', (key, code = SOURCE_LOCALE, vars) => {
    const value = lookup(key, code);
    if (typeof value !== 'string') {
      throw new Error(`i18n: "${key}" is not a string, use tObject`);
    }
    return interpolate(value, vars);
  });

  eleventyConfig.addFilter('tObject', (key, code = SOURCE_LOCALE) =>
    lookup(key, code),
  );

  eleventyConfig.addFilter('docsUrl', (docsPath, code = SOURCE_LOCALE) => {
    const locale = locales.find((l) => l.code === code);
    return DOCS_ORIGIN + (locale ? locale.docs : '') + docsPath;
  });

  // Numbers written the way the locale writes them (11 211, 11,211, 11.211);
  // `compact` gives 1,1 k / 1.1K.
  eleventyConfig.addFilter('formatNumber', (value, code = SOURCE_LOCALE, compact) => {
    const locale = locales.find((l) => l.code === code);
    return new Intl.NumberFormat(locale ? locale.lang : 'en', {
      notation: compact ? 'compact' : 'standard',
    }).format(value);
  });

  // A price in euros, written the way the locale writes it (9,99 €, €9.99).
  eleventyConfig.addFilter('formatPrice', (value, code = SOURCE_LOCALE) => {
    const locale = locales.find((l) => l.code === code);
    return new Intl.NumberFormat(locale ? locale.lang : 'en', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  });

  eleventyConfig.addFilter('i18nClient', (prefixes) => {
    const out = {};
    for (const {code} of locales) {
      out[code] = Object.fromEntries(
        Object.entries(flat[code]).filter(([key]) =>
          prefixes.some((prefix) => key.startsWith(prefix + '.')),
        ),
      );
    }
    return out;
  });
};
