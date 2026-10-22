/**
 * /down: the page the dashboard frames when the API is down. Reads the
 * public status of health.moddy.app, shows the current incident and links
 * to it, and refreshes every 30 s (the API caches 30 s) while the tab is
 * visible. Each answer is also posted to the parent frame, so the dashboard
 * can leave this page once everything is back.
 */

import '@material/web/icon/icon.js';

const STATUS_URL = 'https://health.moddy.app/v1/status';
const STATUS_PAGE = 'https://status.moddy.app';
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

type Theme = {light: string; dark: string};
const themes = JSON.parse($('down-themes').textContent!) as Record<
  'incident' | 'maintenance',
  Theme
>;

/** Red for an incident, orange for a maintenance, in the visitor's mode
 * (same rule as the inline script of default.html). */
function applyTheme(kind: 'incident' | 'maintenance') {
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

function render(data: Status) {
  const incidents =
    data.incidents ??
    ([data.incident, data.maintenance].filter(Boolean) as Incident[]);
  // The most severe incident (`incident`), else the first one.
  const current = data.incident ?? incidents[0];
  const maintenance = current?.type === 'maintenance';

  applyTheme(maintenance ? 'maintenance' : 'incident');
  $('down-icon').textContent = maintenance ? 'build_circle' : 'error';
  $('down-title').textContent = t(maintenance ? 'titleMaintenance' : 'title');
  $('down-description').textContent = t(
    maintenance ? 'descriptionMaintenance' : 'description',
  );
  $('down-label').textContent = t(maintenance ? 'labelMaintenance' : 'labelIncident');
  $('down-link-label').textContent = t(maintenance ? 'maintenanceLink' : 'incident');
  $('down-incident-link').setAttribute('href', current?.url || STATUS_PAGE);

  const box = $('down-incident');
  box.hidden = !current;
  if (!current) return;
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

async function refresh() {
  try {
    const response = await fetch(STATUS_URL, {signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as Status;
    render(data);
    if (window.parent !== window) {
      window.parent.postMessage(
        {source: 'moddy-down', status: data.status, updatedAt: data.updated_at},
        '*',
      );
    }
  } catch {
    // Keep what is on screen: the generic text and the status page link.
  } finally {
    document.documentElement.classList.remove('loading-status');
  }
}

refresh();
setInterval(() => {
  if (document.visibilityState === 'visible') refresh();
}, REFRESH_MS);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refresh();
});

export {};
