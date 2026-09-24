import "server-only"

import { siteConfig } from "@/lib/site-config"

/**
 * Server-side data access for the public Moddy API.
 *
 * Everything here runs on the server (RSC / ISR), never in the browser:
 * responses are cached by Next.js for `REVALIDATE_SECONDS`, so the pages stay
 * static and fast, and the API is hit at most once per window. When a call
 * fails, the function returns `null` and the UI hides the related block
 * instead of showing made-up numbers.
 *
 * Set `MODDY_API_MOCK=1` in development to read `fixtures/*.json` instead.
 */

const REVALIDATE_SECONDS = 600 // Matches the API's Cache-Control max-age.
const TIMEOUT_MS = 5000

const useMocks =
  process.env.MODDY_API_MOCK === "1" && process.env.NODE_ENV !== "production"

/** `GET /public/stats`. Fields other than guilds/users may not be deployed yet. */
export type PublicStats = {
  guilds: number
  users: number
  members?: number
  commands_30d?: number
  moderation_cases?: number
  measured_at: string
  updated_at: string
}

/** One entry of `GET /public/stats/top-guilds`. */
export type ShowcaseGuild = {
  /** Snowflake as a string (19 digits overflow a JS number). */
  id: string
  name: string
  /** `null` when the server has no icon: render its initials instead. */
  icon_url: string | null
  member_count: number
}

/** `GET https://health.moddy.app/v1/status`. */
export type HealthStatus = {
  status: HealthLevel
  updated_at: string
  services: { id: string; name: string; status: HealthLevel }[]
}

export type HealthLevel =
  | "operational"
  | "degraded_performance"
  | "partial_outage"
  | "major_outage"
  | "maintenance"

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function readFixture<T>(name: string): Promise<T | null> {
  const fixture = await import(`@/fixtures/${name}.json`)
  return fixture.default as T
}

export async function getPublicStats(): Promise<PublicStats | null> {
  if (useMocks) return readFixture<PublicStats>("public-stats")

  const stats = await fetchJson<PublicStats>(
    `${siteConfig.apiUrl}/public/stats`
  )
  if (!stats || typeof stats.guilds !== "number") return null
  return stats
}

export async function getShowcaseGuilds(): Promise<ShowcaseGuild[]> {
  if (useMocks) {
    const fixture = await readFixture<{ guilds: ShowcaseGuild[] }>("top-guilds")
    return fixture?.guilds ?? []
  }

  const data = await fetchJson<{ guilds: ShowcaseGuild[] }>(
    `${siteConfig.apiUrl}/public/stats/top-guilds`
  )
  return Array.isArray(data?.guilds) ? data.guilds : []
}

export async function getHealthStatus(): Promise<HealthStatus | null> {
  if (useMocks) return readFixture<HealthStatus>("health-status")

  const status = await fetchJson<HealthStatus>(
    `${siteConfig.healthUrl}/v1/status`
  )
  return status && typeof status.status === "string" ? status : null
}

/**
 * `GET /redirects/lookup`. The documented payload only describes the entry;
 * the destination is read from `target` (what the previous site used), with
 * `url` / `destination` accepted as aliases.
 */
export async function lookupRedirect(path: string): Promise<string | null> {
  const url = new URL(`${siteConfig.apiUrl}/redirects/lookup`)
  url.searchParams.set("domain", new URL(siteConfig.url).host)
  url.searchParams.set("path", path)

  const entry = await fetchJson<Record<string, unknown> | null>(url.toString())
  const target = entry?.target ?? entry?.url ?? entry?.destination
  return typeof target === "string" && /^https?:\/\//.test(target)
    ? target
    : null
}
