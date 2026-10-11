/**
 * The Discord ads: one illustration per module, played on a virtual clock.
 *
 * Each ad is one illustration (the ad's text goes in the Discord message):
 * an inner panel of the home page filling the 550 x 300 frame, that plays
 * one full cycle and comes back to its first frame, so the GIF loops
 * without a jump. The illustrations reuse the home page's markup and
 * classes (home-page.css) wherever the home page has one; ads.css only adds
 * what the home page doesn't draw.
 *
 * Time: every pause goes through wait(), which follows a virtual clock that
 * render.mjs advances one frame at a time (window.__advance). CSS
 * animations and transitions are paused and set to that clock too, so a
 * frame is exact whatever the machine's speed. Without `&render` in the URL
 * the clock follows real time (preview in a browser).
 */

const params = new URLSearchParams(location.search);
const adName = params.get('ad') ?? 'altguard';
const lang = params.get('lang') ?? 'fr';
const rendering = params.has('render');

document.documentElement.lang = lang;

const strings = await (await fetch(`/i18n/${lang}.json`)).json();

/** The string at `key` (dotted path) in the ad's language. */
function t(key) {
  const value = key.split('.').reduce((node, part) => node?.[part], strings);
  if (value === undefined) throw new Error(`Missing string "${key}" (${lang})`);
  return value;
}

/* -------------------------------------------------------------------------
 * Virtual clock
 * ----------------------------------------------------------------------- */

const clock = {now: 0, timers: []};

/** Resolves once the virtual clock has moved `ms` forward. */
function wait(ms) {
  return new Promise((resolve) => clock.timers.push({at: clock.now + ms, resolve}));
}

const animationStarts = new WeakMap();

/** Holds every CSS animation and transition on the virtual clock. */
function syncAnimations() {
  for (const animation of document.getAnimations()) {
    let start = animationStarts.get(animation);
    if (start === undefined) {
      start = clock.now;
      animationStarts.set(animation, start);
      animation.pause();
    }
    animation.currentTime = clock.now - start;
  }
}

const settle = async () => {
  for (let i = 0; i < 4; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};

let finished = false;

/** Moves the clock `ms` forward, running what was waiting on the way. */
window.__advance = async (ms) => {
  const target = clock.now + ms;
  for (;;) {
    clock.timers.sort((a, b) => a.at - b.at);
    const next = clock.timers[0];
    if (!next || next.at > target) break;
    clock.timers.shift();
    clock.now = next.at;
    next.resolve();
    await settle();
    syncAnimations();
  }
  clock.now = target;
  syncAnimations();
  return finished;
};

/** Same pseudo-random numbers on every render (typing rhythm). */
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------
 * Helpers shared by the scenes (same as src/pages/home-page.ts)
 * ----------------------------------------------------------------------- */

/**
 * Elements with data-at appear at that step, data-done-at get "done"
 * (spinner -> check), data-press-at are pressed during that step.
 */
function stepper(root) {
  const all = (attribute) => [...root.querySelectorAll(`[${attribute}]`)];
  const timed = all('data-at');
  const done = all('data-done-at');
  const pressed = all('data-press-at');
  return (step) => {
    for (const el of timed) el.classList.toggle('shown', Number(el.dataset.at) <= step);
    for (const el of done) el.classList.toggle('done', Number(el.dataset.doneAt) <= step);
    for (const el of pressed) el.classList.toggle('pressed', Number(el.dataset.pressAt) === step);
  };
}

/** Fades the demo out, puts it back in its first state, fades it in. */
async function resetDemo(root, restore) {
  root.classList.add('resetting');
  await wait(550);
  restore();
  // The first state is there at once, as on the first frame of the GIF.
  for (const animation of document.getAnimations()) {
    if (animation instanceof CSSTransition && animation.effect.target !== root) animation.finish();
  }
  root.classList.remove('resetting');
  await wait(450);
}

/**
 * A conversation taller than its window scrolls like a chat: the log slides
 * up so its last shown message sits at the bottom of the window.
 */
function followBottom(windowEl, log) {
  return () => {
    const top = log.getBoundingClientRect().top;
    let bottom = 0;
    for (const child of log.querySelectorAll(':scope > *')) {
      if (child.matches('[data-at]:not(.shown)')) continue;
      bottom = Math.max(bottom, child.getBoundingClientRect().bottom - top);
    }
    const offset = Math.max(0, Math.ceil(bottom - windowEl.clientHeight));
    log.style.translate = `0 ${-offset}px`;
  };
}

const icon = (name, extra = '') =>
  `<span class="material-symbols-outlined${extra ? ' ' + extra : ''}">${name}</span>`;

const avatar = (name, size = 36, extra = '') =>
  `<img class="${extra} avatar-3d" src="/images/avatars/${name}.webp" alt="" width="${size}" height="${size}" />`;

/** A message in a channel, like the ticket thread of the home page. */
const message = (who, body, {bot = false, time = '', attrs = ''} = {}) => `
  <div class="ticket-msg" ${attrs}>
    ${who === 'moddy' ? avatar('moddy', 32, 'ticket-avatar') : avatar(who, 32, 'ticket-avatar')}
    <span class="ticket-body">
      <span class="ticket-author">${who === 'moddy' ? 'Moddy' : who}${bot ? ` <span class="ticket-tag">${t('common.app')}</span>` : ''}${time ? ` <span class="ad-time">${time}</span>` : ''}</span>
      ${body}
    </span>
  </div>`;

const mention = (text) => `<span class="ad-mention">${text}</span>`;

/** Fills {name} placeholders of a string with HTML. */
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');

/* -------------------------------------------------------------------------
 * Scenes
 * ----------------------------------------------------------------------- */

const scenes = {};

/* AutoMod AI, images: the same hacked account posts a crypto scam, then an
 * explicit picture, in two servers side by side. Without Moddy it stays
 * and members fall for it; with Moddy it is gone at once and the chat goes
 * on. */
const VS_VARIANTS = ['scam', 'nsfw'];

scenes['automod-images'] = {
  html: () => {
    const msg = (who, text, extra = '') => `
      <div class="ad-mini-msg" ${extra}>
        ${avatar(who, 24)}
        <span class="ad-mini-body"><span class="ad-mini-author">${who}</span><span>${text}</span></span>
      </div>`;
    const post = `
      <span class="ad-mini-body">
        <span class="ad-mini-author">leo</span>
        <span><span class="only-scam">${t('automodImages.scamText')}</span><span class="only-nsfw">${t('automodImages.nsfwText')}</span></span>
        <span class="ad-fold"><span class="ad-fold-inner">
          <span class="ad-picture ad-phone only-scam">
            <span class="ad-phone-bar"><span>01:19</span><span>${icon('signal_cellular_alt')}${icon('battery_full')}</span></span>
            <span class="ad-phone-title">${t('automodImages.phone.title')}</span>
            <strong>${t('automodImages.phone.amount')}</strong>
            <span class="ad-phone-sub">${t('automodImages.phone.value')}</span>
            <span class="ad-phone-row"><span>${t('automodImages.phone.status')}</span><b>${t('automodImages.phone.done')}</b></span>
          </span>
          <span class="ad-picture ad-picture-hidden only-nsfw">${icon('visibility_off')}<span>${t('automodImages.sensitive')}</span></span>
        </span></span>
      </span>`;
    const replies = (variant) =>
      ['mia', 'sam', 'alex'].map((who, i) =>
        msg(who, t(`automodImages.replies.${variant}.${i}`), `data-at="${i + 2}" data-only="${variant}"`)).join('');
    return `
    <div class="panel ad-vs" data-demo data-variant="scam">
      <div class="ad-vs-col">
        <span class="ad-vs-label">${icon('block')}${t('automodImages.without')}</span>
        <div class="ad-scroll"><div class="ad-vs-log">
          ${msg('alex', t('automodImages.before'))}
          <div class="ad-mini-msg" data-at="1">${avatar('leo', 24)}${post}</div>
          ${VS_VARIANTS.map(replies).join('')}
        </div></div>
      </div>
      <div class="ad-vs-col ad-vs-moddy">
        <span class="ad-vs-label">${avatar('moddy', 18)}${t('automodImages.with')}</span>
        <div class="ad-scroll"><div class="ad-vs-log">
          ${msg('alex', t('automodImages.before'))}
          <div class="ad-mini-msg ad-mini-target" data-at="1" data-state="posted">
            ${avatar('leo', 24)}${post}
            <span class="ad-mini-verdict">
              <span class="guard-verdict-icon">${icon('shield')}</span>
              <span class="ad-mini-body">
                <strong><span class="only-scam">${t('automodImages.verdictScam')}</span><span class="only-nsfw">${t('automodImages.verdictNsfw')}</span></strong>
                <span>${t('automodImages.detail')}</span>
              </span>
            </span>
          </div>
          ${msg('mia', `<span class="only-scam">${t('automodImages.calm.scam')}</span><span class="only-nsfw">${t('automodImages.calm.nsfw')}</span>`, 'data-at="3"')}
        </div></div>
      </div>
    </div>`;
  },
  async play(root) {
    const show = stepper(root);
    const target = root.querySelector('.ad-mini-target');
    const follows = [...root.querySelectorAll('.ad-scroll')].map((el) =>
      followBottom(el, el.firstElementChild));
    const step = (n) => {
      show(n);
      follows.forEach((follow) => follow());
    };
    root.classList.add('playing');
    const restore = () => {
      target.dataset.state = 'posted';
      root.dataset.variant = 'scam';
      step(0);
    };
    restore();
    for (const variant of VS_VARIANTS) {
      root.dataset.variant = variant;
      step(0);
      await wait(700);
      step(1); // the hacked account posts, on both servers
      await wait(1300);
      target.dataset.state = 'removed'; // Moddy removes it at once
      await wait(250);
      step(1);
      await wait(700);
      step(2);
      await wait(1100);
      step(3);
      await wait(1100);
      step(4);
      await wait(3000);
      await resetDemo(root, restore);
    }
  },
};

/* AutoMod AI, context: the same word in a joke between friends and in a
 * real threat. A word filter blocks both; AutoMod AI reads the context. */
scenes['automod-context'] = {
  html: () => {
    const result = `
      <span class="ad-result">
        <span class="ad-chip ad-chip-error r-blocked">${icon('block')}${t('automodContext.blocked')}</span>
        <span class="ad-chip r-wait">${icon('progress_activity', 'spin')}${t('automodContext.analyzing')}</span>
        <span class="ad-chip ad-chip-ok r-ok">${icon('check_circle')}${t('automodContext.joke')}</span>
        <span class="ad-chip ad-chip-error r-threat">${icon('shield')}${t('automodContext.threat')}</span>
      </span>`;
    const word = `<mark class="ad-word">${t('automodContext.word')}</mark>`;
    return `
    <div class="panel ad-context" data-demo data-mode="filter">
      <div class="ad-modes">
        <span class="ad-mode-pill"></span>
        <span class="ad-mode m-filter">${icon('format_list_bulleted')}${t('automodContext.filter')}</span>
        <span class="ad-mode m-ai">${icon('smart_toy')}${t('automodContext.ai')}</span>
      </div>
      <ul class="guard-list">
        <li class="guard-msg">
          ${avatar('sam', 36, 'guard-avatar')}
          <span class="guard-body">
            <span class="guard-author">sam</span>
            <span class="guard-text">${t('automodContext.m1')}</span>
          </span>
        </li>
        <li class="guard-msg ad-judged" data-result="">
          ${avatar('mia', 36, 'guard-avatar')}
          <span class="guard-body">
            <span class="guard-author">mia</span>
            <span class="guard-text">${fill(t('automodContext.jokeText'), {word})}</span>
          </span>
          ${result}
        </li>
        <li class="guard-msg ad-judged" data-result="">
          ${avatar('troublemaker', 36, 'guard-avatar')}
          <span class="guard-body">
            <span class="guard-author">troublemaker</span>
            <span class="guard-text">${fill(t('automodContext.threatText'), {word})}</span>
          </span>
          ${result}
        </li>
      </ul>
    </div>`;
  },
  async play(root) {
    const [joke, threat] = root.querySelectorAll('.ad-judged');
    await wait(700);
    // The word filter only sees the word: both messages are blocked.
    root.classList.add('marking');
    await wait(600);
    joke.dataset.result = 'blocked';
    await wait(150);
    threat.dataset.result = 'blocked';
    await wait(2000);
    // AutoMod AI reads both messages in their context.
    root.dataset.mode = 'ai';
    root.classList.remove('marking');
    joke.dataset.result = 'wait';
    threat.dataset.result = 'wait';
    await wait(1400);
    joke.dataset.result = 'ok';
    await wait(450);
    threat.dataset.result = 'threat';
    await wait(3200);
    await resetDemo(root, () => {
      root.dataset.mode = 'filter';
      joke.dataset.result = '';
      threat.dataset.result = '';
    });
  },
};

/* AutoMod AI, profile pictures: a member joins with an explicit avatar
 * (never shown: an empty picture), it is checked on arrival, the moderators get the
 * alert. */
scenes['automod-avatar'] = {
  html: () => `
    <div class="panel ad-avatar" data-demo>
      <div class="ag-member">
        ${avatar('mia', 36, 'ag-avatar')}
        <span class="ag-who"><strong>mia</strong><span>${t('automodAvatar.joined')}</span></span>
        <span class="status">${t('automodAvatar.member')}</span>
      </div>
      <div class="ag-member ad-newcomer" data-at="1" data-state="arrived">
        <span class="ad-blurred">
          ${icon('visibility_off')}
          <svg class="ad-ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20.5" /></svg>
        </span>
        <span class="ag-who"><strong>nyx_77</strong><span>${t('automodAvatar.joined')}</span></span>
        <span class="status ad-newcomer-state">
          <span class="s-arrived">${t('automodAvatar.new')}</span>
          <span class="s-analyzing">${icon('progress_activity', 'spin')}${t('automodAvatar.analyzing')}</span>
          <span class="s-caught">${t('automodAvatar.caught')}</span>
        </span>
      </div>
      <div class="ad-channel ad-alert-head" data-at="4">${icon('tag')}<span>${t('automodAvatar.modChannel')}</span></div>
      <div class="log-entry tone-ban ad-alert" data-at="4">
        ${icon('gpp_bad')}
        <span class="log-body">
          <strong>${t('automodAvatar.alert')}</strong>
          <span class="log-meta">${t('automodAvatar.alertMeta')}</span>
        </span>
      </div>
    </div>`,
  async play(root) {
    const show = stepper(root);
    const newcomer = root.querySelector('.ad-newcomer');
    root.classList.add('playing');
    show(0);
    await wait(700);
    newcomer.dataset.state = 'arrived';
    show(1);
    await wait(1000);
    newcomer.dataset.state = 'analyzing';
    await wait(1800);
    newcomer.dataset.state = 'caught';
    await wait(700);
    show(4);
    await wait(3400);
    await resetDemo(root, () => {
      show(0);
      newcomer.dataset.state = 'arrived';
    });
  },
};

/* Brocoli: the home page's conversation as is. The log scrolls like a chat
 * once it no longer fits the frame. */
scenes['brocoli'] = {
  html: () => `
    <div class="panel chat ad-chat" data-demo>
      <div class="ad-scroll">
        <div class="chat-log">
          <div class="chat-msg user" data-at="1">
            <span class="chat-author">${t('brocoli.you')}</span>
            <div class="bubble">${t('brocoli.prompt')}</div>
          </div>
          <div class="chat-msg ai" data-at="2">
            <span class="chat-author">${icon('auto_awesome')}${t('brocoli.assistant')}</span>
            <div class="chat-steps">
              ${[['read', 2], ['stepWelcome', 3], ['stepRole', 4]].map(([key, at]) => `
                <div class="chat-step" data-at="${at}" data-done-at="${at + 1}">
                  <span class="step-icon">${icon('progress_activity', 'spinner')}${icon('check_circle', 'check')}</span>
                  ${t('brocoli.' + key)}
                </div>`).join('')}
            </div>
          </div>
          <div class="chat-msg ai" data-at="7">
            <div class="bubble">${t('brocoli.answer')}</div>
          </div>
          <span class="chat-applied" data-at="8">${icon('check_circle')}${t('brocoli.applied')}</span>
        </div>
      </div>
      <div class="chat-bottom">
        <div class="chat-input">
          <span class="chat-input-text" data-placeholder="${t('brocoli.placeholder')}"></span>
          <span class="chat-send">${icon('arrow_upward')}</span>
        </div>
        <div class="chat-confirm">
          ${t('brocoli.confirm')}
          <div class="chat-confirm-actions">
            <span class="fake-button filled" data-press-at="6">${t('brocoli.apply')}</span>
            <span class="fake-button">${t('brocoli.cancel')}</span>
          </div>
        </div>
      </div>
    </div>`,
  async play(chat) {
    const input = chat.querySelector('.chat-input-text');
    const send = chat.querySelector('.chat-send');
    const log = chat.querySelector('.chat-log');
    const follow = followBottom(chat.querySelector('.ad-scroll'), log);
    const prompt = t('brocoli.prompt');
    const random = seeded(7);
    const show = stepper(chat);
    chat.classList.add('playing');
    show(0);

    await wait(500);
    // Type the question, then send it.
    input.classList.add('typing');
    for (let i = 1; i <= prompt.length; i++) {
      input.textContent = prompt.slice(0, i);
      input.scrollLeft = input.scrollWidth;
      await wait(28 + random() * 40);
    }
    await wait(350);
    send.classList.add('pressed');
    await wait(160);
    send.classList.remove('pressed');
    input.classList.remove('typing');
    input.textContent = '';

    const timeline = [
      [1, 700], // the question appears
      [2, 1300], // reading the configuration
      [3, 1100], // first change planned
      [4, 1100], // second change planned
      [5, 1500], // "Apply these 2 changes?"
      [6, 500], // Apply is pressed
      [7, 1200], // the answer
      [8, 3400], // "2 modules configured", then a pause
    ];
    for (const [step, delay] of timeline) {
      show(step);
      follow();
      // Steps 5-6: the confirmation stands in for the message box.
      chat.classList.toggle('confirming', step === 5 || step === 6);
      await wait(delay);
    }
    await resetDemo(chat, () => {
      show(0);
      follow();
    });
  },
};

/* AltGuard: the home page's demo as is, a member who passes then a second
 * account that is blocked. */
scenes['altguard'] = {
  html: () => `
    <div class="panel altguard-demo" data-demo="altguard" data-variant="pass">
      <div class="ag-member">
        ${avatar('alex', 36, 'ag-avatar only-pass')}${avatar('alex2', 36, 'ag-avatar only-block')}
        <span class="ag-who">
          <strong><span class="only-pass">alex</span><span class="only-block">alex_2</span></strong>
          <span>${t('altguard.joined')}</span>
        </span>
        <span class="status ag-state">
          <span class="ag-state-wait">${t('altguard.unverified')}</span>
          <span class="ag-state-pass">${t('altguard.verified')}</span>
          <span class="ag-state-block">${t('altguard.blockedChip')}</span>
        </span>
      </div>
      <div class="ag-checks">
        ${[['device', 'devices', 1], ['email', 'mail', 2], ['network', 'lan', 3], ['servers', 'dns', 4]]
          .map(([key, symbol, at], index) => `
          <span class="ag-check${index === 0 ? ' ag-hit' : ''}" data-at="${at}" data-done-at="${at + 1}">
            ${icon(symbol, 'ag-icon')}
            ${t('altguard.' + key)}
            <span class="ag-result">
              ${icon('progress_activity', 'spinner')}${icon('check_circle', 'ok')}${icon('error', 'hit')}
            </span>
          </span>`).join('')}
      </div>
      <div class="ag-verdict" data-at="6">
        ${icon('verified_user', 'only-pass')}${icon('gpp_bad', 'only-block')}
        <span class="only-pass">${t('altguard.passed')}</span>
        <span class="only-block">${t('altguard.blocked')}</span>
      </div>
    </div>`,
  async play(root) {
    const show = stepper(root);
    root.classList.add('playing');
    show(0);
    const timeline = [
      [0, 900], // a member joins, unverified
      [1, 600], // device
      [2, 600], // email
      [3, 600], // network
      [4, 600], // servers
      [5, 500], // last check done
      [6, 2800], // the verdict
    ];
    for (const variant of ['pass', 'block']) {
      root.dataset.variant = variant;
      for (const [step, pause] of timeline) {
        show(step);
        root.classList.toggle('decided', step >= 6);
        await wait(pause);
      }
      await resetDemo(root, () => {
        show(0);
        root.classList.remove('decided');
        root.dataset.variant = 'pass';
      });
    }
  },
};

/* Bump Reminder: the #bump channel over an afternoon. Moddy calls the
 * channel back for each directory the moment its bump opens again. */
const REMINDERS = [
  // [directory, minutes after 16:00]
  ['DISBOARD', 0],
  ['DiscordL', 45],
  ['French.gg', 105],
];

scenes['bump-reminder'] = {
  html: () => {
    const time = new Intl.DateTimeFormat(lang, {hour: 'numeric', minute: '2-digit', timeZone: 'UTC'});
    const at = (minutes) => time.format(new Date((16 * 60 + minutes) * 60000));
    const later = (minutes) =>
      minutes % 60 ? fill(t('bump.laterMin'), {m: minutes}) : fill(t('bump.laterHours'), {h: minutes / 60});
    return `
    <div class="panel ad-bump" data-demo>
      <div class="ad-channel">${icon('tag')}<span>bump</span></div>
      <div class="ad-scroll">
        <div class="ad-log">
          ${REMINDERS.map(([name, minutes], index) => `
            ${index ? `<div class="ad-divider" data-at="${index * 2 - 1}"><span>${later(minutes - REMINDERS[index - 1][1])}</span></div>` : ''}
            ${message('moddy', `<span class="ad-text">${fill(t('bump.ready'), {role: mention('@Bumpers'), name: `<strong>${name}</strong>`, command: mention('/bump')})}</span>`, {bot: true, time: at(minutes), attrs: `data-at="${index * 2}"`})}`).join('')}
        </div>
      </div>
    </div>`;
  },
  async play(root) {
    const show = stepper(root);
    const follow = followBottom(root.querySelector('.ad-scroll'), root.querySelector('.ad-log'));
    const restore = () => {
      show(0);
      follow();
    };
    root.classList.add('playing');
    restore();
    const timeline = [
      [0, 1800], // DISBOARD
      [1, 600], // 45 min later
      [2, 1700], // DiscordL
      [3, 600], // 1 h later
      [4, 3200], // French.gg
    ];
    for (const [step, pause] of timeline) {
      show(step);
      follow();
      await wait(pause);
    }
    await resetDemo(root, restore);
  },
};

/* Auto-Restore Roles: a member leaves, their roles go into Moddy's memory
 * (except the excluded one), they come back and get them again. */
const ROLES = [
  ['level', 'tone-primary'],
  ['artist', 'tone-tertiary'],
  ['vip', 'tone-secondary'],
  ['mod', 'tone-outline'],
];

scenes['auto-restore-roles'] = {
  html: () => {
    const role = (key, tone, extra = '') =>
      `<span class="ad-role ${tone}${extra}" data-role="${key}"><i></i>${t('restore.roles.' + key)}</span>`;
    const slots = ROLES.map(([key, tone]) => role(key, tone, ' ad-slot')).join('');
    return `
    <div class="panel ad-restore" data-demo data-state="in">
      <div class="ad-member-card">
        <div class="ad-member-top">
          ${avatar('mia', 36, 'ag-avatar')}
          <span class="ag-who">
            <strong>mia</strong>
            <span class="ad-states"><span class="s-in">${t('restore.in')}</span><span class="s-left">${t('restore.left')}</span><span class="s-back">${t('restore.back')}</span></span>
          </span>
          <span class="status ad-member-state ad-states"><span class="s-in">${t('restore.inChip')}</span><span class="s-left">${t('restore.leftChip')}</span><span class="s-back">${t('restore.backChip')}</span></span>
        </div>
        <div class="ad-slots ad-slots-member">${slots}</div>
      </div>
      <div class="ad-later" data-at="2"><span class="status">${icon('schedule')}${t('restore.later')}</span></div>
      <div class="ad-vault">
        <div class="ad-vault-head">
          <span class="shape small shape-hexagon tone-tertiary">${icon('history')}</span>
          <span class="ad-vault-title">${t('restore.vault')}</span>
          <span class="ad-chip ad-chip-ok ad-restored" data-at="5">${icon('check_circle')}${t('restore.restored')}</span>
        </div>
        <div class="ad-slots ad-slots-vault">${slots}<span class="ad-excluded" data-at="1">${icon('block')}${t('restore.excluded')}</span></div>
      </div>
      ${ROLES.map(([key, tone]) => role(key, tone, ' ad-flying')).join('')}
    </div>`;
  },
  async play(root) {
    const show = stepper(root);
    const flying = [...root.querySelectorAll('.ad-flying')];
    const memberSlots = [...root.querySelectorAll('.ad-slots-member .ad-slot')];
    const vaultSlots = [...root.querySelectorAll('.ad-slots-vault .ad-slot')];
    const base = root.getBoundingClientRect();
    const place = (chip, slot) => {
      const rect = slot.getBoundingClientRect();
      chip.style.translate = `${rect.left - base.left}px ${rect.top - base.top}px`;
    };
    const restore = () => {
      root.dataset.state = 'in';
      show(0);
      flying.forEach((chip, i) => {
        chip.classList.remove('excluded');
        place(chip, memberSlots[i]);
      });
    };

    root.classList.add('playing');
    restore();
    await wait(1000);
    // mia leaves: her roles go into Moddy's memory, the excluded one doesn't.
    root.dataset.state = 'left';
    await wait(500);
    for (let i = 0; i < 3; i++) {
      place(flying[i], vaultSlots[i]);
      await wait(130);
    }
    flying[3].classList.add('excluded');
    show(1);
    await wait(1200);
    show(2); // two weeks later
    await wait(1300);
    root.dataset.state = 'back';
    await wait(700);
    for (let i = 0; i < 3; i++) {
      place(flying[i], memberSlots[i]);
      await wait(150);
    }
    await wait(500);
    show(5);
    await wait(3000);
    await resetDemo(root, restore);
  },
};

/* Social Notifications: the #announcements channel, where Moddy posts a
 * live, a video, a post and an article as they come out. */
const POSTS = [
  ['twitch', 'Twitch', 'videocam'],
  ['youtube', 'YouTube', 'smart_display'],
  ['bluesky', 'Bluesky', 'chat_bubble'],
  ['rss', 'RSS', 'rss_feed'],
];

scenes['social-notifications'] = {
  html: () => `
    <div class="panel ad-social" data-demo>
      <div class="ad-channel">${icon('tag')}<span>${t('social.channel')}</span></div>
      <div class="ad-scroll">
        <div class="ad-log">
          ${POSTS.map(([key, name, symbol], index) => message(
            'moddy',
            `<span class="ad-text">${fill(t('social.posts.' + key + '.text'), {role: mention(t('social.posts.' + key + '.role'))})}</span>
            <span class="command-reply ad-embed">
              <span class="from">${icon(symbol)}${name} · ${t('social.posts.' + key + '.author')}</span>
              <strong>${t('social.posts.' + key + '.title')}</strong>
            </span>`,
            {bot: true, attrs: `data-at="${index}"`},
          )).join('')}
        </div>
      </div>
    </div>`,
  async play(root) {
    const show = stepper(root);
    const follow = followBottom(root.querySelector('.ad-scroll'), root.querySelector('.ad-log'));
    const restore = () => {
      show(0);
      follow();
    };
    root.classList.add('playing');
    restore();
    for (const [step, pause] of [[0, 2000], [1, 1900], [2, 1900], [3, 3000]]) {
      show(step);
      follow();
      await wait(pause);
    }
    await resetDemo(root, restore);
  },
};

/* Voice Transcription: someone can't listen, a voice message arrives, the
 * Transcribe button turns it into text, word by word as the audio plays. */
const WAVE = [
  0.3, 0.5, 0.8, 0.6, 0.9, 0.5, 0.35, 0.7, 1, 0.75, 0.45, 0.3, 0.55, 0.85, 0.6, 0.4,
  0.7, 0.95, 0.65, 0.4, 0.3, 0.5, 0.8, 0.55, 0.35, 0.6, 0.9, 0.7, 0.45, 0.3, 0.5, 0.25,
];

scenes['voice-transcription'] = {
  html: () => `
    <div class="panel ad-voice" data-demo data-state="button">
      <div class="ad-channel">${icon('tag')}<span>${t('voice.channel')}</span></div>
      <div class="ad-voice-log">
        ${message('leo', `<span class="ad-text">${t('voice.m1')}</span>`)}
        ${message('mia', `
          <span class="ad-note">
            <span class="ad-play">${icon('play_arrow')}</span>
            <span class="ad-wave">${WAVE.map((h) => `<i style="--h: ${h}"></i>`).join('')}</span>
            <span class="ad-note-time">0:07</span>
          </span>`, {attrs: 'data-at="1"'})}
        ${message('moddy', `
          <span class="ad-transcribe">
            <span class="ad-buttons t-button"><span class="fake-button" data-press-at="3">${icon('graphic_eq')}${t('voice.button')}</span></span>
            <span class="ad-chip t-loading">${icon('progress_activity', 'spin')}${t('voice.loading')}</span>
            <span class="command-reply t-result">
              <span class="ad-meta">
                <span class="ad-meta-chip">${icon('translate')}${t('voice.language')}</span>
                <span class="ad-meta-chip">${icon('timer')}0:07</span>
                <span class="ad-meta-chip">${icon('person')}${t('voice.requested')}</span>
              </span>
              <span class="ad-transcript">${t('voice.text').split(' ').map((word) => `<span>${word}</span>`).join(' ')}</span>
            </span>
          </span>`, {bot: true, attrs: 'data-at="2"'})}
      </div>
    </div>`,
  async play(root) {
    const show = stepper(root);
    const bars = [...root.querySelectorAll('.ad-wave i')];
    const words = [...root.querySelectorAll('.ad-transcript > span')];
    const restore = () => {
      show(0);
      root.dataset.state = 'button';
      bars.forEach((bar) => bar.classList.remove('on'));
      words.forEach((word) => word.classList.remove('said'));
    };
    root.classList.add('playing');
    restore();
    await wait(700);
    show(1); // the voice message
    await wait(900);
    show(2); // Moddy's Transcribe button
    await wait(1100);
    show(3); // pressed
    await wait(220);
    show(4);
    root.dataset.state = 'loading';
    await wait(1000);
    root.dataset.state = 'result';
    // The words come as the audio plays.
    for (let i = 0; i < words.length; i++) {
      words[i].classList.add('said');
      const upTo = Math.round(((i + 1) / words.length) * bars.length);
      bars.forEach((bar, index) => bar.classList.toggle('on', index < upTo));
      await wait(150);
    }
    await wait(3000);
    await resetDemo(root, restore);
  },
};

/* -------------------------------------------------------------------------
 * The page: the illustration alone
 * ----------------------------------------------------------------------- */

const scene = scenes[adName];
if (!scene) throw new Error(`Unknown ad "${adName}"`);

const main = document.getElementById('ad');
main.innerHTML = scene.html();
const root = main.querySelector('.panel');

// Nothing is captured before the fonts and pictures are there.
await Promise.all([
  document.fonts.load('600 16px "Google Sans"'),
  document.fonts.load('400 16px "Google Sans"'),
  document.fonts.load('400 16px "Google Sans Mono"'),
  document.fonts.load('24px "Material Symbols Outlined"'),
  ...[...document.images].map((img) => img.decode().catch(() => {})),
]);
await document.fonts.ready;
syncAnimations();

// The scene sets its first state synchronously: it is shown at once, not
// transitioned to from the markup's.
const first = scene.play(root);
for (const animation of document.getAnimations()) {
  if (animation instanceof CSSTransition) animation.finish();
}
syncAnimations();

if (rendering) {
  first.then(() => (finished = true));
  window.__ready = true;
} else {
  // Preview: the virtual clock follows real time, and the scene loops.
  (async () => {
    await first;
    for (;;) await scene.play(root);
  })();
  let last = performance.now();
  const tick = async (now) => {
    await window.__advance(now - last);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
