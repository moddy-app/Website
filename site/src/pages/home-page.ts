/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Motion on the home page (/site/index.html). Everything here is decoration:
// the page is complete without it, and nothing runs when the visitor asked
// for reduced motion.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Cards below the fold rise in as they scroll into view. Cards already on
 * screen are left alone so nothing blinks on load.
 */
function revealCards() {
  const cards = [...document.querySelectorAll<HTMLElement>('.home .card')];
  const hidden = cards.filter(
    (card) => card.getBoundingClientRect().top > window.innerHeight,
  );
  if (!hidden.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('reveal');
        observer.unobserve(entry.target);
      }
    },
    {rootMargin: '0px 0px -10% 0px'},
  );
  for (const card of hidden) {
    card.classList.add('reveal');
    observer.observe(card);
  }
}

/**
 * The hero feed brings its last event back to the top every few seconds, as
 * if a new one had just happened. The time labels stay in place so the top
 * row always reads "just now".
 */
function rotateFeed() {
  const feed = document.querySelector<HTMLElement>('.home .feed');
  if (!feed) return;
  const times = [...feed.querySelectorAll('.feed-time')].map(
    (time) => time.textContent,
  );

  window.setInterval(() => {
    if (document.hidden) return;
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
    // Force a layout so the jump above is applied before the transition.
    void feed.offsetHeight;
    last.classList.add('entering');
    feed.classList.add('sliding');
    feed.style.transform = '';
  }, 3200);
}

/** Numbers marked `data-count-up` count from zero when they come into view. */
function countUp() {
  const numbers = document.querySelectorAll<HTMLElement>('[data-count-up]');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const el = entry.target as HTMLElement;
      const target = Number(el.dataset.countUp);
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  });
  numbers.forEach((el) => observer.observe(el));
}

/** Animates a number from zero, or sets it at once with reduced motion. */
function animateNumber(el: HTMLElement, target: number, format: Intl.NumberFormat) {
  if (reduceMotion.matches) {
    el.textContent = format.format(target);
    return;
  }
  const start = performance.now();
  const duration = 1400;
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format.format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const API = 'https://api.moddy.app';
const ICON_ORIGIN = 'https://cdn.discordapp.com/';

interface PublicStats {
  guilds: number;
  users: number;
  commands_30d: number;
  moderation_cases: number;
}

interface TopGuild {
  id: string;
  name: string;
  icon_url: string | null;
  member_count: number;
}

/** Up to two initials, for servers without an icon. */
function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => [...word][0])
      .join('')
      .toUpperCase() || '?'
  );
}

/**
 * One chip for a server. Everything the API sends is set as text or as a
 * checked attribute, never as HTML: server names are user content.
 */
function guildChip(guild: TopGuild, membersLabel: string, format: Intl.NumberFormat) {
  const chip = document.createElement('span');
  chip.className = 'guild-chip';

  let icon: HTMLElement;
  if (guild.icon_url && guild.icon_url.startsWith(ICON_ORIGIN)) {
    const img = document.createElement('img');
    img.src = guild.icon_url.replace(/size=\d+/, 'size=64');
    img.alt = '';
    img.loading = 'lazy';
    img.width = 36;
    img.height = 36;
    // A dead icon URL falls back to the initials, like a server without one.
    img.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = 'guild-icon';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.textContent = initials(guild.name);
      img.replaceWith(fallback);
    });
    icon = img;
  } else {
    icon = document.createElement('span');
    icon.textContent = initials(guild.name);
  }
  icon.classList.add('guild-icon');
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'guild-text';
  const name = document.createElement('span');
  name.className = 'guild-name';
  name.textContent = guild.name;
  const members = document.createElement('span');
  members.className = 'guild-members';
  members.textContent = membersLabel.replace(
    '{count}',
    format.format(guild.member_count),
  );
  text.append(name, members);

  chip.append(icon, text);
  return chip;
}

/**
 * Fills the live numbers card from the public stats API. The card stays
 * hidden if the numbers cannot be loaded (API down, or a preview deployment
 * whose origin the API does not allow).
 */
async function loadStats() {
  const card = document.querySelector<HTMLElement>('#stats');
  if (!card) return;
  const lang = document.documentElement.lang || 'en';
  const format = new Intl.NumberFormat(lang);
  const compact = new Intl.NumberFormat(lang, {notation: 'compact'});

  let stats: PublicStats;
  try {
    const response = await fetch(`${API}/public/stats`);
    if (!response.ok) return;
    stats = await response.json();
  } catch {
    return;
  }
  if (!stats.guilds) return;

  const values: Record<string, number> = {
    guilds: stats.guilds,
    users: stats.users,
    commands: stats.commands_30d,
    cases: stats.moderation_cases,
  };
  card.hidden = false;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    card.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
      animateNumber(el, values[el.dataset.stat!] ?? 0, format);
    });
  });
  observer.observe(card);

  try {
    const response = await fetch(`${API}/public/stats/top-guilds`);
    if (!response.ok) return;
    const {guilds} = (await response.json()) as {guilds: TopGuild[]};
    if (!guilds?.length) return;

    const rows = card.querySelector<HTMLElement>('.guild-rows')!;
    const membersLabel = card.dataset.membersLabel ?? '{count}';
    const half = Math.ceil(guilds.length / 2);
    for (const part of [guilds.slice(0, half), guilds.slice(half)]) {
      if (!part.length) continue;
      const row = document.createElement('div');
      row.className = 'chip-row';
      // Twice, so the marquee loops; the copy is hidden from screen readers.
      for (const copy of [false, true]) {
        for (const guild of part) {
          const chip = guildChip(guild, membersLabel, compact);
          if (copy) chip.setAttribute('aria-hidden', 'true');
          row.append(chip);
        }
      }
      rows.append(row);
    }
    rows.hidden = false;
  } catch {
    // The numbers alone are fine.
  }
}

loadStats();

if (!reduceMotion.matches) {
  revealCards();
  rotateFeed();
  countUp();
}
