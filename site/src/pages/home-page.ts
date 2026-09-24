/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Behaviour of the home page (/site/index.html): live numbers, and motion.
// The page is complete without this script; with "reduce motion" on, the
// numbers are still refreshed but nothing animates.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lang = document.documentElement.lang || 'en';
const numberFormat = new Intl.NumberFormat(lang);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `callback` the first time `el` scrolls into view. */
function onceVisible(el: Element, callback: () => void) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    callback();
  });
  observer.observe(el);
}

/**
 * Calls `step` in a loop while `el` is on screen and the tab is visible, so
 * the looping illustrations cost nothing when nobody looks at them.
 */
function loopWhileVisible(el: Element, step: () => Promise<void>) {
  let visible = false;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    while (visible && !document.hidden) {
      await step();
    }
    running = false;
  };
  new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    run();
  }).observe(el);
  document.addEventListener('visibilitychange', run);
}

/** Counts a number up from zero, written in the page's locale. */
function countTo(el: HTMLElement, target: number) {
  if (reduceMotion) {
    el.textContent = numberFormat.format(target);
    return;
  }
  const start = performance.now();
  const duration = 1600;
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = numberFormat.format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* -------------------------------------------------------------------------
 * Live activity: the last event comes back to the top, as if it had just
 * happened. Time labels stay in place so the top row always reads "just now".
 * ----------------------------------------------------------------------- */

/**
 * Brings the last item of a list back on top every few seconds, as if it had
 * just happened (live activity, log channel). Labels matching `fixed` stay
 * in place, so the top row always reads "just now".
 */
function rotateList(selector: string, every: number, fixed?: string) {
  const list = document.querySelector<HTMLElement>(selector);
  if (!list) return;
  const labels = fixed
    ? [...list.querySelectorAll(fixed)].map((label) => label.textContent)
    : [];

  loopWhileVisible(list, async () => {
    await wait(every);
    const last = list.lastElementChild as HTMLElement | null;
    if (!last) return;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const shift = last.getBoundingClientRect().height + gap;

    list.classList.remove('sliding');
    list.style.transform = `translateY(-${shift}px)`;
    list.prepend(last);
    if (fixed) {
      list.querySelectorAll(fixed).forEach((label, index) => {
        label.textContent = labels[index];
      });
    }
    last.classList.remove('entering');
    void list.offsetHeight; // apply the jump before the transition
    last.classList.add('entering');
    list.classList.add('sliding');
    list.style.transform = '';
  });
}

function rotateFeed() {
  rotateList('.home .feed', 3000, '.feed-time');
  rotateList('.home .log-list', 2400);
}

/* -------------------------------------------------------------------------
 * Numbers
 * ----------------------------------------------------------------------- */

function countUpNumbers() {
  document.querySelectorAll<HTMLElement>('[data-count-up]').forEach((el) => {
    onceVisible(el, () => countTo(el, Number(el.dataset.countUp)));
  });
}

/**
 * The stats cards come with the numbers of the last build. On moddy.app the
 * API answers the browser too, so they are refreshed; elsewhere (previews)
 * the build numbers stay.
 */
async function liveStats() {
  const group = document.querySelector<HTMLElement>('#stats');
  if (!group) return;
  const values = () =>
    group.querySelectorAll<HTMLElement>('.stat-value[data-stat]');

  try {
    const response = await fetch('https://api.moddy.app/public/stats');
    if (response.ok) {
      const stats = await response.json();
      if (stats.guilds) {
        const fresh: Record<string, number> = {
          guilds: stats.guilds,
          users: stats.users,
          commands: stats.commands_30d,
          cases: stats.moderation_cases,
        };
        values().forEach((el) => {
          const value = fresh[el.dataset.stat!];
          if (typeof value === 'number') el.dataset.value = String(value);
        });
        group.hidden = false;
      }
    }
  } catch {
    // Keep the numbers from the build.
  }

  if (group.hidden) return;
  const first = group.querySelector('.card');
  if (!first) return;
  onceVisible(first, () => {
    values().forEach((el) => countTo(el, Number(el.dataset.value)));
  });
}

/** Server icons that fail to load: initials instead, or just the color. */
function guildIconFallbacks() {
  const fallback = (img: HTMLImageElement) => {
    if (img.classList.contains('guild-bg')) {
      img.remove();
      return;
    }
    const tile = img.closest('.guild-tile');
    const initials = document.createElement('span');
    initials.className = 'guild-icon';
    initials.setAttribute('aria-hidden', 'true');
    initials.textContent =
      tile?.querySelector('.guild-name')?.textContent?.trim().slice(0, 1).toUpperCase() ?? '?';
    img.replaceWith(initials);
  };
  document
    .querySelectorAll<HTMLImageElement>('.guild-tile img')
    .forEach((img) => {
      if (img.complete && img.naturalWidth === 0) fallback(img);
      else img.addEventListener('error', () => fallback(img), {once: true});
    });
}

/* -------------------------------------------------------------------------
 * Server tiles take the main color of the server's icon, like album art
 * players do, with white or dark text depending on that color. Discord's
 * CDN allows reading the pixels (CORS), the <img> asks for it.
 * ----------------------------------------------------------------------- */

const tileColors = new Map<string, Promise<[number, number, number] | null>>();

/** A representative color: the average of the icon, weighted towards its
 *  most saturated pixels so a colorful logo on white does not turn grey. */
function mainColor(img: HTMLImageElement): [number, number, number] | null {
  const size = 24;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d', {willReadFrequently: true});
  if (!context) return null;
  try {
    context.drawImage(img, 0, 0, size, size);
    const {data} = context.getImageData(0, 0, size, size);
    let r = 0, g = 0, b = 0, total = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const weight = 0.15 + (max === 0 ? 0 : (max - min) / max);
      r += data[i] * weight;
      g += data[i + 1] * weight;
      b += data[i + 2] * weight;
      total += weight;
    }
    if (!total) return null;
    return [r / total, g / total, b / total];
  } catch {
    return null; // tainted canvas: keep the theme tint
  }
}

function colorTiles() {
  document.querySelectorAll<HTMLElement>('.guild-tile').forEach((tile) => {
    const img = tile.querySelector<HTMLImageElement>('img.guild-bg');
    if (!img) return;
    const apply = async () => {
      let color = tileColors.get(img.src);
      if (!color) {
        color = Promise.resolve(mainColor(img));
        tileColors.set(img.src, color);
      }
      const rgb = await color;
      if (!rgb) return;
      // Deepen very light colors a little so the tile never looks washed out.
      const [r, g, b] = rgb.map((v) => Math.round(v * 0.9));
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      tile.style.setProperty('--tile-bg', `rgb(${r}, ${g}, ${b})`);
      tile.style.setProperty('--tile-fg', luminance > 0.6 ? '#1b1b1f' : '#ffffff');
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, {once: true});
  });
}

/* -------------------------------------------------------------------------
 * Played illustrations share one mechanism: elements with data-at appear at
 * that step, data-done-at get "done" (spinner -> check), data-press-at are
 * pressed during that step, data-pick-at stay picked from that step on.
 * ----------------------------------------------------------------------- */

function stepper(root: HTMLElement) {
  const all = (attribute: string) => [
    ...root.querySelectorAll<HTMLElement>(`[${attribute}]`),
  ];
  const timed = all('data-at');
  const done = all('data-done-at');
  const pressed = all('data-press-at');
  const picked = all('data-pick-at');
  return (step: number) => {
    for (const el of timed) el.classList.toggle('shown', Number(el.dataset.at) <= step);
    for (const el of done) el.classList.toggle('done', Number(el.dataset.doneAt) <= step);
    for (const el of pressed) el.classList.toggle('pressed', Number(el.dataset.pressAt) === step);
    for (const el of picked) el.classList.toggle('picked', Number(el.dataset.pickAt) <= step);
  };
}

/** Plays `timeline` ([step, pause in ms]) in a loop while on screen. */
function playDemo(
  root: HTMLElement,
  timeline: Array<[number, number]>,
  hooks: {beforeLoop?: () => void; onStep?: (step: number) => void} = {},
) {
  const show = stepper(root);
  root.classList.add('playing');
  show(0);
  hooks.onStep?.(0);
  loopWhileVisible(root, async () => {
    hooks.beforeLoop?.();
    for (const [step, pause] of timeline) {
      show(step);
      hooks.onStep?.(step);
      await wait(pause);
    }
    root.classList.add('resetting');
    await wait(550);
    show(0);
    hooks.onStep?.(0);
    root.classList.remove('resetting');
    await wait(450);
  });
}

function playTickets() {
  const root = document.querySelector<HTMLElement>('[data-demo="tickets"]');
  if (!root) return;
  playDemo(root, [
    [0, 900], // the panel
    [1, 900], // "Report a member" is picked
    [2, 900], // the private channel opens
    [3, 1400], // Moddy greets
    [4, 3200], // a moderator claims it
  ]);
}

/** Alternates a member who passes and a second account that is blocked. */
function playAltGuard() {
  const root = document.querySelector<HTMLElement>('[data-demo="altguard"]');
  if (!root) return;
  let blocked = true;
  playDemo(
    root,
    [
      [0, 900], // a member joins, unverified
      [1, 600], // device
      [2, 600], // email
      [3, 600], // network
      [4, 600], // servers
      [5, 500], // last check done
      [6, 3200], // the verdict
    ],
    {
      beforeLoop: () => {
        blocked = !blocked;
        root.dataset.variant = blocked ? 'block' : 'pass';
      },
      onStep: (step) => root.classList.toggle('decided', step >= 6),
    },
  );
}

/* -------------------------------------------------------------------------
 * Brocoli: the question is typed and sent, Brocoli reads the configuration,
 * plans two changes, asks for confirmation, applies them and answers.
 * Elements with data-at appear at that step; steps with data-done-at get
 * their check mark then; data-press-at buttons get pressed.
 * ----------------------------------------------------------------------- */

function playBrocoli() {
  const chat = document.querySelector<HTMLElement>('.chat');
  if (!chat) return;
  const input = chat.querySelector<HTMLElement>('.chat-input-text')!;
  const send = chat.querySelector<HTMLElement>('.chat-send')!;
  const prompt = input.dataset.prompt ?? '';
  const show = stepper(chat);

  chat.classList.add('playing');
  show(0);

  loopWhileVisible(chat, async () => {
    // Type the question, then send it.
    input.classList.add('typing');
    for (let i = 1; i <= prompt.length; i++) {
      input.textContent = prompt.slice(0, i);
      await wait(28 + Math.random() * 40);
    }
    await wait(350);
    send.classList.add('pressed');
    await wait(160);
    send.classList.remove('pressed');
    input.classList.remove('typing');
    input.textContent = '';

    const timeline: Array<[number, number]> = [
      [1, 700], // the question appears
      [2, 1300], // reading the configuration
      [3, 1100], // first change planned
      [4, 1100], // second change planned
      [5, 1500], // "Apply these 2 changes?"
      [6, 500], // Apply is pressed
      [7, 1200], // the answer
      [8, 4200], // "2 modules configured", then a pause
    ];
    for (const [step, delay] of timeline) {
      show(step);
      // Steps 5-6: the confirmation stands in for the message box.
      chat.classList.toggle('confirming', step === 5 || step === 6);
      await wait(delay);
    }

    chat.classList.add('resetting');
    await wait(600);
    show(0);
    chat.classList.remove('resetting');
    await wait(400);
  });
}

/* -------------------------------------------------------------------------
 * Dashboard replica: switches work, and now and then a module row lights up
 * and its switch flips by itself, followed by a "Changes saved" toast. It
 * stays still while the visitor's pointer is over the replica.
 * ----------------------------------------------------------------------- */

function dashboardReplica() {
  const mock = document.querySelector<HTMLElement>('.mock');
  if (!mock) return;
  const switches = [...mock.querySelectorAll<HTMLButtonElement>('.switch')];
  const toast = mock.querySelector<HTMLElement>('.mock-toast')!;
  let toastTimer = 0;

  const flip = (button: HTMLButtonElement) => {
    const on = button.getAttribute('aria-checked') === 'true';
    button.setAttribute('aria-checked', String(!on));
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  };
  switches.forEach((button) =>
    button.addEventListener('click', () => flip(button)),
  );

  if (reduceMotion) return;

  let hovered = false;
  mock.addEventListener('pointerenter', () => (hovered = true));
  mock.addEventListener('pointerleave', () => (hovered = false));

  let next = 1;
  loopWhileVisible(mock, async () => {
    await wait(2600);
    if (hovered) return;
    const button = switches[next % switches.length];
    const row = button.closest('.mock-module');
    next += 2;
    row?.classList.add('changing');
    await wait(700);
    if (!hovered) flip(button);
    await wait(900);
    row?.classList.remove('changing');
  });
}

guildIconFallbacks();
colorTiles();
liveStats();
dashboardReplica();

if (!reduceMotion) {
  rotateFeed();
  countUpNumbers();
  playBrocoli();
  playTickets();
  playAltGuard();
}

// A module: keeps these names out of the global scope.
export {};
