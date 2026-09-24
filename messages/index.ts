import type common from "./en/common.json"
import type home from "./en/home.json"
import type modules from "./en/modules.json"
import type notFound from "./en/notFound.json"
import type premium from "./en/premium.json"

// One JSON file per namespace and per locale, e.g. messages/fr/home.json.
export const namespaces = [
  "common",
  "home",
  "premium",
  "modules",
  "notFound",
] as const

export type Messages = {
  common: typeof common
  home: typeof home
  premium: typeof premium
  modules: typeof modules
  notFound: typeof notFound
}

export async function loadMessages(locale: string): Promise<Messages> {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => {
      const file = await import(`./${locale}/${namespace}.json`)
      return [namespace, file.default] as const
    })
  )

  return Object.fromEntries(entries) as Messages
}
