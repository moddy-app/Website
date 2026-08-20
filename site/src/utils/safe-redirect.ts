/**
 * Convert an untrusted navigation value into an allowlisted first-party URL.
 *
 * Never pass a query parameter directly to `location.href`: schemes such as
 * `javascript:` execute in the current origin and can read authenticated data.
 */

const FIRST_PARTY_ORIGINS = new Set([
  'https://moddy.app',
  'https://www.moddy.app',
  'https://dashboard.moddy.app',
]);

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export function safeRedirectUrl(
  value: string | null | undefined,
  currentOrigin: string = window.location.origin,
): string | null {
  const candidate = value?.trim();
  if (!candidate || CONTROL_CHARACTERS.test(candidate) || candidate.includes('\\')) {
    return null;
  }

  try {
    const base = new URL(currentOrigin);
    const target = new URL(candidate, base);
    const isLocalDevelopment =
      target.origin === base.origin &&
      (base.hostname === 'localhost' || base.hostname === '127.0.0.1');

    if (target.protocol !== 'https:' && !isLocalDevelopment) {
      return null;
    }
    if (target.username || target.password) {
      return null;
    }
    if (target.origin !== base.origin && !FIRST_PARTY_ORIGINS.has(target.origin)) {
      return null;
    }

    return target.href;
  } catch {
    return null;
  }
}
