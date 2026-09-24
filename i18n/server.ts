import "server-only"

import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { routing, type Locale } from "./routing"

/**
 * Reads the `[locale]` route param, 404s on unknown locales and enables
 * static rendering for the request. Call it first in every page and layout.
 */
export async function resolveLocale(
  params: Promise<{ locale: string }>
): Promise<Locale> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return locale
}
