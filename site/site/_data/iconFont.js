/**
 * The Material Symbols stylesheet with only the icons the site uses
 * (`icon_names`): the full font is about 4 MB, so icons took seconds to
 * appear, or showed their names ("error", "close") once the browser gave
 * up waiting. The subset weighs a few dozen KB.
 *
 * The names are found at build time: every string or element text in the
 * templates (site/) and scripts (src/) that is the name of a Material
 * Symbol (eleventy-helpers/material-symbols-names.txt, from
 * google/material-design-icons). An icon written in either place is
 * picked up; one built from pieces at runtime would not be, so write
 * icon names out in full.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const KNOWN = new Set(
  fs
    .readFileSync(path.join(ROOT, 'eleventy-helpers', 'material-symbols-names.txt'), 'utf8')
    .split('\n')
    .filter(Boolean),
);

// Element text (>name<) and quoted strings ('name', "name", `name`).
const CANDIDATE = />\s*([a-z0-9_]+)\s*<|['"`]([a-z0-9_]+)['"`]/g;

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'i18n') walk(full, out);
    } else if (/\.(html|njk|md|ts|js)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

module.exports = () => {
  const names = new Set();
  for (const file of walk(path.join(ROOT, 'site'), walk(path.join(ROOT, 'src'), []))) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(CANDIDATE)) {
      const name = match[1] || match[2];
      if (KNOWN.has(name)) names.add(name);
    }
  }
  const list = [...names].sort();
  return {
    names: list,
    // display=block: an icon stays blank until its font arrives, instead of
    // showing its ligature name for a moment.
    href:
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' +
      `&icon_names=${list.join(',')}&display=block`,
  };
};
