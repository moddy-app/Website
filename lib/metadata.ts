import type { Metadata } from "next"

import { getPathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"

/**
 * Canonical URL + hreflang alternates for a route, e.g. getAlternates("/premium", "fr").
 * Paths are resolved against `metadataBase` (set in the locale layout).
 */
export function getAlternates(
  href: string,
  locale: Locale
): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href, locale: l })])
  )

  return {
    canonical: getPathname({ href, locale }),
    languages: {
      ...languages,
      "x-default": getPathname({ href, locale: routing.defaultLocale }),
    },
  }
}
