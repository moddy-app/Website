/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Moddy Max page (/premium): plan picker and purchase.
//
// Buying goes through api.moddy.app, which knows who pays from the
// .moddy.app session cookie and answers with a Stripe Checkout URL:
//   POST /stripe/create-checkout {plan, return_url} -> {url}
//   401: nobody signed in -> Discord sign-in, then back here with ?plan=
//   403 premium_blocked_user: account under a global sanction
// Stripe sends the visitor back to return_url with ?premium=success|cancel.
// The subscription itself is activated by Stripe's webhook, so after a
// success we ask GET /stripe/subscription until it reports it active.

const API = 'https://api.moddy.app';
type Plan = 'monthly' | 'yearly';

const page = document.querySelector<HTMLElement>('.premium');
const strings: Record<string, string> = JSON.parse(
  document.querySelector('#premium-strings')?.textContent || '{}',
);
const returnUrl = page?.dataset.returnUrl ?? 'https://moddy.app/premium/';
const serversUrl =
  page?.dataset.serversUrl ?? 'https://dashboard.moddy.app/select-premium-servers';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Only these two values are ever sent: anything else bills yearly. */
function asPlan(value: string | null | undefined): Plan | null {
  return value === 'monthly' || value === 'yearly' ? value : null;
}

/* -------------------------------------------------------------------------
 * Status card
 * ----------------------------------------------------------------------- */

const statusCard = document.querySelector<HTMLElement>('#premium-status');

interface Status {
  title: string;
  text: string;
  icon?: string;
  error?: boolean;
  action?: {label: string; run: () => void};
}

function showStatus(status: Status | null) {
  if (!statusCard) return;
  if (!status) {
    statusCard.hidden = true;
    return;
  }
  statusCard.querySelector('[data-status-title]')!.textContent = status.title;
  statusCard.querySelector('[data-status-text]')!.textContent = status.text;
  statusCard.querySelector('[data-status-icon]')!.textContent =
    status.icon ?? 'workspace_premium';
  statusCard.classList.toggle('is-error', Boolean(status.error));

  const action = statusCard.querySelector<HTMLElement>('[data-status-action]')!;
  const fresh = action.cloneNode(false) as HTMLElement; // drop old listeners
  action.replaceWith(fresh);
  if (status.action) {
    fresh.textContent = status.action.label;
    fresh.hidden = false;
    fresh.addEventListener('click', status.action.run);
  } else {
    fresh.hidden = true;
  }

  statusCard.hidden = false;
  statusCard.scrollIntoView({behavior: 'smooth', block: 'center'});
}

statusCard
  ?.querySelector('[data-status-dismiss]')
  ?.addEventListener('click', () => showStatus(null));

const errorStatus = (): Status => ({
  title: strings.errorTitle,
  text: strings.errorText,
  icon: 'error',
  error: true,
});

/* -------------------------------------------------------------------------
 * Plan picker
 * ----------------------------------------------------------------------- */

const pricing = document.querySelector<HTMLElement>('#pricing');
let selectedPlan: Plan = 'yearly';

function selectPlan(plan: Plan) {
  selectedPlan = plan;
  if (!pricing) return;
  pricing.dataset.plan = plan;
  pricing.querySelectorAll<HTMLElement>('[data-plan]').forEach((button) => {
    button.setAttribute('aria-checked', String(button.dataset.plan === plan));
  });
  const amount = pricing.querySelector<HTMLElement>('.price-amount')!;
  const period = pricing.querySelector<HTMLElement>('.price-period')!;
  amount.classList.add('changing');
  setTimeout(() => {
    amount.textContent =
      plan === 'monthly' ? amount.dataset.priceMonthly! : amount.dataset.priceYearly!;
    period.textContent =
      plan === 'monthly' ? period.dataset.periodMonthly! : period.dataset.periodYearly!;
    amount.classList.remove('changing');
  }, 150);
}

pricing?.querySelectorAll<HTMLElement>('[data-plan]').forEach((button) => {
  button.addEventListener('click', () => selectPlan(asPlan(button.dataset.plan)!));
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const next: Plan = selectedPlan === 'monthly' ? 'yearly' : 'monthly';
    selectPlan(next);
    pricing.querySelector<HTMLElement>(`[data-plan="${next}"]`)?.focus();
  });
});

/* -------------------------------------------------------------------------
 * Purchase
 * ----------------------------------------------------------------------- */

let buying = false;

async function buy(plan: Plan, button?: HTMLElement) {
  if (buying) return;
  buying = true;
  const label = button?.innerHTML;
  if (button) {
    button.setAttribute('disabled', '');
    button.textContent = button.dataset.loadingLabel ?? '…';
  }
  const restore = () => {
    buying = false;
    if (button && label !== undefined) {
      button.innerHTML = label;
      button.removeAttribute('disabled');
    }
  };

  try {
    const response = await fetch(`${API}/stripe/create-checkout`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({plan, return_url: returnUrl}),
    });

    if (response.status === 401) {
      // Sign in with Discord, then come back here to resume the purchase.
      const back = encodeURIComponent(`${returnUrl}?plan=${plan}`);
      window.location.href = `${API}/auth/login?redirect=${back}`;
      return;
    }
    if (response.status === 403) {
      const body = await response.json().catch(() => ({}));
      restore();
      showStatus(
        body.error === 'premium_blocked_user'
          ? {title: strings.blockedTitle, text: strings.blockedText, icon: 'block', error: true}
          : errorStatus(),
      );
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const {url} = await response.json();
    if (typeof url !== 'string' || !url.startsWith('https://checkout.stripe.com/')) {
      throw new Error('Unexpected checkout URL');
    }
    window.location.href = url;
  } catch {
    restore();
    showStatus(errorStatus());
  }
}

document.querySelectorAll<HTMLElement>('[data-subscribe]').forEach((button) => {
  button.addEventListener('click', () => {
    buy(asPlan(button.dataset.planFixed) ?? selectedPlan, button);
  });
});

/* -------------------------------------------------------------------------
 * Current subscription
 * ----------------------------------------------------------------------- */

interface Subscription {
  is_active: boolean;
  expires_at?: string | null;
  servers?: unknown[];
  max_servers?: number;
}

async function getSubscription(): Promise<Subscription | null> {
  try {
    const response = await fetch(`${API}/stripe/subscription`, {
      credentials: 'include',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function openPortal() {
  try {
    const response = await fetch(`${API}/stripe/portal`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({return_url: returnUrl}),
    });
    const {url} = await response.json();
    if (typeof url === 'string' && url.startsWith('https://')) {
      window.location.href = url;
      return;
    }
  } catch {
    // fall through
  }
  showStatus(errorStatus());
}

function activeStatus(subscription: Subscription): Status {
  const lang = document.documentElement.lang || 'en';
  const used = String(subscription.servers?.length ?? 0);
  const max = String(subscription.max_servers ?? 5);
  const date = subscription.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString(lang, {dateStyle: 'long'})
    : '';
  const text = (date ? strings.activeText : strings.activeTextNoDate)
    .replace('{servers}', used)
    .replace('{max}', max)
    .replace('{date}', date);
  return {
    title: strings.activeTitle,
    text,
    action: {label: strings.manage, run: openPortal},
  };
}

/* -------------------------------------------------------------------------
 * Arriving on the page
 * ----------------------------------------------------------------------- */

async function start() {
  const params = new URLSearchParams(window.location.search);
  const result = params.get('premium');
  const plan = asPlan(params.get('plan'));

  // Clean the URL so a reload doesn't replay the purchase or the message.
  if (result || params.has('plan')) {
    history.replaceState(null, '', window.location.pathname + window.location.hash);
  }

  if (result === 'success') {
    const choose = {
      label: strings.chooseServers,
      run: () => (window.location.href = serversUrl),
    };
    showStatus({title: strings.successTitle, text: strings.pendingText, icon: 'hourglass_top'});
    // The webhook may land a few seconds after the redirect.
    for (let attempt = 0; attempt < 10; attempt++) {
      const subscription = await getSubscription();
      if (subscription?.is_active) break;
      await wait(2000);
    }
    showStatus({
      title: strings.successTitle,
      text: strings.successText,
      icon: 'celebration',
      action: choose,
    });
    return;
  }

  if (result === 'cancel') {
    showStatus({title: strings.cancelTitle, text: strings.cancelText, icon: 'undo'});
    return;
  }

  if (plan) {
    // Back from the Discord sign-in: resume the purchase.
    selectPlan(plan);
    buy(plan, pricing?.querySelector<HTMLElement>('[data-subscribe]') ?? undefined);
    return;
  }

  const subscription = await getSubscription();
  if (subscription?.is_active) showStatus(activeStatus(subscription));
}

start();

// A module: keeps these names out of the global scope.
export {};
