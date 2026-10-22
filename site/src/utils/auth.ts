/**
 * @license
 * Copyright 2024 Moddy App
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Authentication service for Discord OAuth and session management.
 * Auth is entirely cookie-based (HttpOnly session_token set by the backend).
 * The frontend never touches the token directly.
 */

import { API_URL } from './config.js';

export interface Guild {
  id: number;
  name: string;
  icon: string | null;
}

export interface User {
  user_id: string;
  username: string;
  avatar: string | null;
  guilds: Guild[];
  is_staff: boolean;
  staff_roles: string[];
  email?: string | null;
  /** Strongest Moddy verification attribute (`users.attributes`), or null.
   *  Moddy Team membership is `is_staff`, not part of this field. */
  verification?: 'VERIFIED_ORG' | 'VERIFIED_ORG_MEMBER' | 'VERIFIED' | null;
}

/**
 * Builds a Discord CDN avatar URL.
 * Returns a default avatar when the hash is null.
 */
export function getAvatarUrl(userId: string, avatarHash: string | null): string {
  if (!avatarHash) {
    const defaultIndex = Number(BigInt(userId) >> 22n) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`;
}

/**
 * Builds a Discord CDN guild icon URL, or null if the guild has no icon.
 */
export function getGuildIconUrl(
  guildId: number | string,
  iconHash: string | null,
): string | null {
  if (!iconHash) return null;
  const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=128`;
}

/**
 * The current user from the session cookie (null if not logged in), and
 * whether the API answered at all: `reachable` is false when it is down
 * (network error, timeout, 5xx, or Railway's 404 when the app is gone), so
 * callers can tell "signed out" from "cannot sign in right now".
 */
export async function getSession(
  timeoutMs = 8000,
): Promise<{user: User | null; reachable: boolean}> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.status === 401) return {user: null, reachable: true};

    if (!response.ok) {
      console.error('Failed to fetch /auth/me:', response.status);
      return {user: null, reachable: response.status < 500 && response.status !== 404};
    }

    return {user: (await response.json()) as User, reachable: true};
  } catch (error) {
    console.error('Error fetching /auth/me:', error);
    return {user: null, reachable: false};
  }
}

/**
 * Returns the current user from the session cookie, or null if not logged in.
 * This is the single source of truth for auth state — call it at app startup.
 */
export async function getMe(): Promise<User | null> {
  return (await getSession()).user;
}

/**
 * Redirects the browser to the backend Discord OAuth login.
 * The backend handles the full OAuth flow and sets the session cookie.
 */
export function signInWithDiscord(redirectUrl?: string): void {
  const url = new URL(`${API_URL}/auth/login`);
  if (redirectUrl) url.searchParams.set('redirect', redirectUrl);
  window.location.href = url.toString();
}

/**
 * Logs the user out by deleting the server-side session.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

/**
 * Extends the current session TTL.
 * Call periodically (e.g. every 24 h) to keep long-lived users logged in.
 */
export async function refreshSession(): Promise<void> {
  await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Re-fetches the user's guild list from Discord.
 * Use after the user has invited the bot to a new server.
 */
export async function refreshGuilds(): Promise<Guild[]> {
  const response = await fetch(`${API_URL}/auth/refresh-guilds`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh guilds: ${response.status}`);
  }

  const data = await response.json();
  return data.guilds as Guild[];
}
