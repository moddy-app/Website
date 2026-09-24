import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // To add a language: create messages/<locale>/ and add it here.
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]
