import { siteConfig } from "@/lib/site-config"

/**
 * Browser-side session helpers.
 *
 * Auth is entirely cookie based: the API sets an HttpOnly `session_token`
 * cookie on `.moddy.app` after Discord OAuth. The site never reads the token,
 * it only asks the API who the visitor is. Because the cookie is scoped to
 * `.moddy.app`, sessions only exist on moddy.app itself (not on Vercel
 * previews or localhost).
 */

/** Subset of `GET /auth/me` used by the site. */
export type SessionUser = {
  user_id: string
  username: string
  global_name: string | null
  avatar_url: string | null
}

export async function getSessionUser(
  signal?: AbortSignal
): Promise<SessionUser | null> {
  try {
    const response = await fetch(`${siteConfig.apiUrl}/auth/me`, {
      credentials: "include",
      cache: "no-store",
      signal,
    })
    if (!response.ok) return null
    return (await response.json()) as SessionUser
  } catch {
    return null
  }
}

/** Discord OAuth entry point. The API sends the visitor back to the dashboard. */
export function getLoginUrl(redirectTo?: string) {
  const url = new URL(`${siteConfig.apiUrl}/auth/login`)
  if (redirectTo) url.searchParams.set("redirect", redirectTo)
  return url.toString()
}

export async function signOut() {
  try {
    await fetch(`${siteConfig.apiUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  } catch {
    // The session is gone either way from the visitor's point of view.
  }
}

/** Display name, then username: what Discord itself shows. */
export function getDisplayName(user: SessionUser) {
  return user.global_name || user.username
}
