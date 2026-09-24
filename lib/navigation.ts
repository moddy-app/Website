import { siteConfig } from "@/lib/site-config"

/**
 * Main navigation, shared by the header, the mobile menu and the footer.
 * `labelKey` points into the `common.nav` messages.
 */
export const mainNav = [
  { labelKey: "modules", href: "/modules", external: false },
  { labelKey: "premium", href: "/premium", external: false },
  { labelKey: "docs", href: siteConfig.links.docs, external: true },
  { labelKey: "support", href: siteConfig.links.support, external: true },
] as const

export type MainNavItem = (typeof mainNav)[number]
