/**
 * Renders the Discord ad GIFs (550 x 300) from ad.html, frame by frame.
 *
 *   node render.mjs                        every ad, every language
 *   node render.mjs bump-reminder          one ad (every language)
 *   node render.mjs --lang fr --theme dark
 *   node render.mjs --serve                preview at http://localhost:8100/ad.html?ad=altguard&lang=fr
 *
 * The page is drawn with the website's own CSS (global.css, home-page.css,
 * fonts and avatars from site/_prod), so build the site first:
 * `cd site && npm run build:prod`.
 *
 * Time is virtual: the page only moves when this script advances its clock
 * (window.__advance), and every CSS animation is held on that clock, so each
 * frame is exact whatever the machine's speed.
 */

import {createServer} from 'node:http';
import {readFile, mkdir, rm, stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname, extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeContent,
} from '@material/material-color-utilities';

const here = dirname(fileURLToPath(import.meta.url));
const prod = join(here, '..', 'site', '_prod');

export const ADS = [
  'automod-images',
  'automod-context',
  'automod-avatar',
  'automod-sanctions',
  'ai-detector',
  'brocoli',
  'altguard',
  'bump-reminder',
  'auto-restore-roles',
  'social-notifications',
  'voice-transcription',
];
const LANGS = ['fr', 'en'];
const WIDTH = 550;
const HEIGHT = 300;
const FPS = 25;
// Moddy blue, the first seed of site/_data/palettes.js.
const SEED = '#003BCC';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const positional = args.filter(
  (arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--'),
);

/* -------------------------------------------------------------------------
 * Theme: the same generation as site/_data/palettes.js.
 * ----------------------------------------------------------------------- */

const ROLES = [
  'background', 'onBackground', 'surface', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
  'surfaceContainerHigh', 'surfaceContainerHighest', 'onSurface',
  'surfaceVariant', 'onSurfaceVariant', 'inverseSurface', 'inverseOnSurface',
  'outline', 'outlineVariant', 'shadow', 'scrim', 'surfaceTint', 'primary',
  'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'inversePrimary',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
];
const kebab = (name) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

function themeCss(seed, dark) {
  const scheme = new SchemeContent(Hct.fromInt(argbFromHex(seed)), dark, 0);
  let css = ':root{';
  for (const role of ROLES) {
    css += `--md-sys-color-${kebab(role)}:${hexFromArgb(MaterialDynamicColors[role].getArgb(scheme))};`;
  }
  return css + '}';
}

/* -------------------------------------------------------------------------
 * A small static server: /ad.html, /ads.*, /i18n/*, /emoji/* and /bots/* from this folder,
 * everything else from the built site.
 * ----------------------------------------------------------------------- */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function startServer(port) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    const local = /^\/(ad\.html|ads\.(css|js)|i18n\/|emoji\/|bots\/)/.test(path);
    const file = join(local ? here : prod, path);
    try {
      if (!(await stat(file)).isFile()) throw new Error('not a file');
      let body = await readFile(file);
      if (path === '/ad.html') {
        const dark = (url.searchParams.get('theme') ?? 'dark') === 'dark';
        const seed = url.searchParams.get('seed') ?? SEED;
        body = body.toString().replace('/* THEME */', themeCss(seed, dark));
      }
      response.writeHead(200, {'content-type': TYPES[extname(file)] ?? 'application/octet-stream'});
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

/* -------------------------------------------------------------------------
 * Capture
 * ----------------------------------------------------------------------- */

async function renderAd(browser, port, ad, lang, theme) {
  const page = await browser.newPage({
    viewport: {width: WIDTH, height: HEIGHT},
    deviceScaleFactor: 1,
  });
  await page.goto(`http://localhost:${port}/ad.html?ad=${ad}&lang=${lang}&theme=${theme}&render`);
  await page.waitForFunction(() => window.__ready === true, null, {timeout: 30000});

  const frames = join(here, '.frames', `${ad}-${lang}-${theme}`);
  await rm(frames, {recursive: true, force: true});
  await mkdir(frames, {recursive: true});

  const step = 1000 / FPS;
  let count = 0;
  // Safety stop at 40 s: a scene always ends long before.
  while (count < FPS * 40) {
    await page.screenshot({path: join(frames, `${String(count).padStart(4, '0')}.png`)});
    count++;
    const done = await page.evaluate((ms) => window.__advance(ms), step);
    if (done) break;
  }
  await page.close();

  const out = join(here, 'gifs', lang, theme === 'dark' ? '' : theme, `${ad}.gif`);
  await mkdir(dirname(out), {recursive: true});
  // One palette for the whole GIF (the theme colors), error diffusion for
  // the avatars and the soft areas, only the changed rectangle per frame.
  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-framerate', String(FPS),
    '-i', join(frames, '%04d.png'),
    '-filter_complex',
    'split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle',
    '-loop', '0',
    out,
  ]);
  const size = (await stat(out)).size;
  console.log(`${out.replace(here + '/', '')}  ${(count / FPS).toFixed(1)} s  ${(size / 1024).toFixed(0)} KB`);
}

const port = Number(option('port', 8100));
const server = await startServer(port);

if (args.includes('--serve')) {
  console.log(`Preview: http://localhost:${port}/ad.html?ad=altguard&lang=fr&theme=dark`);
} else {
  const ads = positional.length ? positional : ADS;
  const langs = option('lang') ? [option('lang')] : LANGS;
  const theme = option('theme', 'dark');
  const browser = await chromium.launch();
  for (const ad of ads) {
    for (const lang of langs) {
      await renderAd(browser, port, ad, lang, theme);
    }
  }
  await browser.close();
  server.close();
}
