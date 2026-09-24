import type { Locale } from "@/i18n/routing"

export const siteConfig = {
  name: "Moddy",
  url: "https://moddy.app",
  apiUrl: "https://api.moddy.app",
  healthUrl: "https://health.moddy.app",
  healthServiceId: "moddy-website",
  links: {
    install: "https://api.moddy.app/install",
    dashboard: "https://dashboard.moddy.app",
    premiumServers: "https://dashboard.moddy.app/select-premium-servers",
    docs: "https://docs.moddy.app",
    support: "https://discord.gg/Z6F5Jg4WwF",
    status: "https://status.moddy.app",
    github: "https://github.com/moddy-app",
    email: "mailto:hello@moddy.app",
    terms: "https://docs.moddy.app/legal/tos",
    privacy: "https://docs.moddy.app/legal/privacy",
    license: "https://docs.moddy.app/legal/license",
  },
  /** Languages Moddy speaks in Discord (API: /guilds/{id}/settings/language). */
  botLanguages: ["en-US", "fr", "es-ES", "pt-BR", "de"],
} as const

/**
 * Builds a docs.moddy.app URL in the visitor's language.
 * English lives at the root, other languages under /<locale>.
 */
export function docsUrl(path: string, locale: Locale) {
  const base = siteConfig.links.docs
  const prefix = locale === "en" ? "" : `/${locale}`
  return `${base}${prefix}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Bot install link (Discord OAuth: adds the bot and signs in). `content`
 * identifies the button in the acquisition stats (UTM, free text).
 */
export function installUrl(content: string) {
  const url = new URL(siteConfig.links.install)
  url.searchParams.set("utm_medium", "website")
  url.searchParams.set("utm_content", content)
  return url.toString()
}
