/**
 * /down: the page the dashboard frames when the API is down. Reads the
 * public status of health.moddy.app and shows the current incident. With no
 * incident and every service operational, it still asks api.moddy.app
 * itself: if the API does not answer (down, or Railway's 404 when the app
 * is gone), the page keeps saying the services are unavailable; when both
 * answer, it says something went wrong and to try again. Refreshes every 30 s (health caches
 * 30 s) while the tab is visible, and posts each answer to the parent
 * frame, so the dashboard can leave this page once everything is back.
 */

import '@material/web/icon/icon.js';

const STATUS_URL = 'https://health.moddy.app/v1/status';
const STATUS_PAGE = 'https://status.moddy.app';
// A public route of the API that answers moddy.app (CORS), as on the home page.
const API_PROBE_URL = 'https://api.moddy.app/public/stats';
const REFRESH_MS = 30_000;

interface Incident {
  id: string;
  type: 'incident' | 'maintenance';
  level: string;
  title: string;
  started_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  url: string | null;
}

interface Status {
  status: string;
  updated_at: string;
  incidents?: Incident[];
  incident: Incident | null;
  maintenance: Incident | null;
}

declare global {
  interface Window {
    moddyI18n?: {code: string; lang: string; dict: Record<string, string>};
  }
}

const i18n = window.moddyI18n ?? {code: 'en', lang: 'en', dict: {}};

function t(key: string, vars: Record<string, string> = {}): string {
  const text = i18n.dict[`down.${key}`] ?? '';
  return text.replace(/\{(\w+)\}/g, (match, name) => vars[name] ?? match);
}

const dateFormat = new Intl.DateTimeFormat(i18n.lang, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return isNaN(date.getTime()) ? '' : dateFormat.format(date);
}

const $ = (id: string) => document.getElementById(id) as HTMLElement;

type Kind = 'incident' | 'maintenance';
type Theme = {light: string; dark: string};
const themes = JSON.parse($('down-themes').textContent!) as Record<Kind, Theme>;

/** Red for a problem, orange for a maintenance, in the visitor's mode (same rule as the inline script of default.html). */
function applyTheme(kind: Kind) {
  let mode = 'auto';
  try {
    mode = localStorage.getItem('color-mode') || 'auto';
  } catch {}
  const {light, dark} = themes[kind];
  $('fixed-theme').textContent =
    mode === 'dark'
      ? dark
      : mode === 'light'
        ? light
        : `${light}@media (prefers-color-scheme: dark){${dark}}`;
}

/** Title, text, mark and buttons for one state of the page. */
function setState(kind: Kind, {title, description, link, href}: {
  title: string;
  description: string;
  link: string;
  href: string;
}) {
  applyTheme(kind);
  $('down-icon').textContent = kind === 'maintenance' ? 'build_circle' : 'error';
  $('down-title').textContent = t(title);
  $('down-description').textContent = t(description);
  $('down-link-label').textContent = t(link);
  $('down-incident-link').setAttribute('href', href);
}

function renderIncident(current: Incident) {
  const maintenance = current.type === 'maintenance';
  setState(maintenance ? 'maintenance' : 'incident', {
    title: maintenance ? 'titleMaintenance' : 'title',
    description: maintenance ? 'descriptionMaintenance' : 'description',
    link: maintenance ? 'maintenanceLink' : 'incident',
    href: current.url || STATUS_PAGE,
  });

  const box = $('down-incident');
  box.hidden = false;
  $('down-label').textContent = t(maintenance ? 'labelMaintenance' : 'labelIncident');
  $('down-incident-title').textContent = current.title;
  $('down-level').textContent = t(`level.${current.level}`) || current.level;
  const scheduled = Boolean(current.starts_at && current.ends_at);
  $('down-when-label').textContent = t(scheduled ? 'labelWindow' : 'labelStarted');
  $('down-when').textContent = scheduled
    ? t('window', {
        start: formatDate(current.starts_at),
        end: formatDate(current.ends_at),
      })
    : formatDate(current.started_at);
  // The id the support team can look up.
  $('down-reference').textContent = current.id ?? '';
  for (const node of box.querySelectorAll<HTMLElement>('[data-ref]')) {
    node.hidden = !current.id;
  }
}

async function fetchHealth(): Promise<Status | null> {
  try {
    const response = await fetch(STATUS_URL, {signal: AbortSignal.timeout(8000)});
    return response.ok ? ((await response.json()) as Status) : null;
  } catch {
    return null;
  }
}

/** Whether the API itself answers. A network error covers both an API
 * that is down and Railway's 404 page, which has no CORS header. */
async function apiAnswers(): Promise<boolean> {
  try {
    const response = await fetch(API_PROBE_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function refresh() {
  const [health, api] = await Promise.all([fetchHealth(), apiAnswers()]);
  const incidents =
    health?.incidents ??
    ([health?.incident, health?.maintenance].filter(Boolean) as Incident[]);
  // The most severe incident (`incident`), else the first one.
  const current = health?.incident ?? incidents[0];
  // Health unreachable: the API alone decides.
  const healthy = !health || health.status === 'operational';
  let state: 'incident' | 'outage' | 'operational';

  if (current) {
    renderIncident(current);
    state = 'incident';
  } else {
    $('down-incident').hidden = true;
    if (healthy && api) {
      // Both answer: the trouble was on the dashboard's side, or is over.
      setState('incident', {
        title: 'titleRetry',
        description: 'descriptionRetry',
        link: 'statusPage',
        href: STATUS_PAGE,
      });
      state = 'operational';
    } else {
      setState('incident', {
        title: 'title',
        description: 'descriptionGeneric',
        link: 'statusPage',
        href: STATUS_PAGE,
      });
      state = 'outage';
    }
  }

  if (window.parent !== window) {
    window.parent.postMessage(
      {source: 'moddy-down', state, health: health?.status ?? null, api},
      '*',
    );
  }
  document.documentElement.classList.remove('loading-status');
}

refresh();
setInterval(() => {
  if (document.visibilityState === 'visible') refresh();
}, REFRESH_MS);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refresh();
});

export {};
