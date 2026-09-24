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
 * Cards rise in as they scroll into view. Cards already on screen are left
 * alone so nothing blinks on load.
 * ----------------------------------------------------------------------- */

function revealCards() {
  const cards = [...document.querySelectorAll<HTMLElement>('.home .card')];
  const below = cards.filter(
    (card) => card.getBoundingClientRect().top > window.innerHeight,
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('reveal');
        observer.unobserve(entry.target);
      }
    },
    {rootMargin: '0px 0px -8% 0px'},
  );
  for (const card of below) {
    card.classList.add('reveal');
    observer.observe(card);
  }
}

/* -------------------------------------------------------------------------
 * Live activity: the last event comes back to the top, as if it had just
 * happened. Time labels stay in place so the top row always reads "just now".
 * ----------------------------------------------------------------------- */

function rotateFeed() {
  const feed = document.querySelector<HTMLElement>('.home .feed');
  if (!feed) return;
  const times = [...feed.querySelectorAll('.feed-time')].map(
    (time) => time.textContent,
  );

  loopWhileVisible(feed, async () => {
    await wait(3000);
    const last = feed.lastElementChild as HTMLElement | null;
    if (!last) return;
    const rowHeight = last.getBoundingClientRect().height;

    feed.classList.remove('sliding');
    feed.style.transform = `translateY(-${rowHeight}px)`;
    feed.prepend(last);
    feed.querySelectorAll('.feed-time').forEach((time, index) => {
      time.textContent = times[index];
    });
    last.classList.remove('entering');
    void feed.offsetHeight; // apply the jump before the transition
    last.classList.add('entering');
    feed.classList.add('sliding');
    feed.style.transform = '';
  });
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
  const timed = [...chat.querySelectorAll<HTMLElement>('[data-at]')];
  const steps = [...chat.querySelectorAll<HTMLElement>('[data-done-at]')];
  const buttons = [...chat.querySelectorAll<HTMLElement>('[data-press-at]')];

  const show = (step: number) => {
    for (const el of timed) {
      el.classList.toggle('shown', Number(el.dataset.at) <= step);
    }
    for (const el of steps) {
      el.classList.toggle('done', Number(el.dataset.doneAt) <= step);
    }
    for (const el of buttons) {
      el.classList.toggle('pressed', Number(el.dataset.pressAt) === step);
    }
  };

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
 * Dashboard replica: switches work, and a pointer comes by now and then to
 * flip one, followed by a "Changes saved" toast. It keeps away while the
 * visitor's own pointer is over the replica.
 * ----------------------------------------------------------------------- */

function dashboardReplica() {
  const mock = document.querySelector<HTMLElement>('.mock');
  if (!mock) return;
  const switches = [...mock.querySelectorAll<HTMLButtonElement>('.switch')];
  const toast = mock.querySelector<HTMLElement>('.mock-toast')!;
  const pointer = mock.querySelector<SVGElement>('.mock-pointer')!;
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
  mock.addEventListener('pointerenter', () => {
    hovered = true;
    pointer.classList.remove('visible');
  });
  mock.addEventListener('pointerleave', () => (hovered = false));

  const moveTo = (el: Element) => {
    const box = mock.getBoundingClientRect();
    const target = el.getBoundingClientRect();
    const x = target.left - box.left + target.width * 0.6;
    const y = target.top - box.top + target.height * 0.55;
    pointer.style.transform = `translate(${x}px, ${y}px)`;
  };

  let next = 1;
  loopWhileVisible(mock, async () => {
    await wait(2200);
    if (hovered) return;
    const button = switches[next % switches.length];
    next += 2;
    pointer.classList.add('visible');
    moveTo(button);
    await wait(1000);
    if (hovered) return;
    pointer.classList.add('pressing');
    await wait(140);
    pointer.classList.remove('pressing');
    flip(button);
    await wait(900);
    pointer.style.transform = `translate(${mock.clientWidth - 40}px, ${mock.clientHeight - 30}px)`;
    await wait(700);
    pointer.classList.remove('visible');
  });
}

guildIconFallbacks();
liveStats();
dashboardReplica();

if (!reduceMotion) {
  revealCards();
  rotateFeed();
  countUpNumbers();
  playBrocoli();
}

// A module: keeps these names out of the global scope.
export {};
