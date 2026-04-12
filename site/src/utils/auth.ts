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
 * Returns the current user from the session cookie, or null if not logged in.
 * This is the single source of truth for auth state — call it at app startup.
 */
export async function getMe(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    });

    if (response.status === 401) return null;

    if (!response.ok) {
      console.error('Failed to fetch /auth/me:', response.status);
      return null;
    }

    return (await response.json()) as User;
  } catch (error) {
    console.error('Error fetching /auth/me:', error);
    return null;
  }
}

/**
 * Redirects the browser to the backend Discord OAuth login.
 * The backend handles the full OAuth flow and sets the session cookie.
 */
export function signInWithDiscord(): void {
  window.location.href = `${API_URL}/auth/login`;
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
