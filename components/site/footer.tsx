import { useLocale, useTranslations } from "next-intl"

import { Separator } from "@/components/ui/separator"
import { LocaleSelect } from "@/components/site/locale-switcher"
import { LogoMark } from "@/components/site/logo"
import { ThemeToggleGroup } from "@/components/site/theme-switcher"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { docsUrl, siteConfig } from "@/lib/site-config"

type FooterLink = {
  labelKey:
    | "dashboard"
    | "modules"
    | "premium"
    | "status"
    | "docs"
    | "support"
    | "github"
    | "contact"
    | "terms"
    | "privacy"
    | "license"
  href: string
  internal?: boolean
}

function getColumns(locale: Locale) {
  return [
    {
      titleKey: "product",
      links: [
        { labelKey: "modules", href: "/modules", internal: true },
        { labelKey: "premium", href: "/premium", internal: true },
        { labelKey: "dashboard", href: siteConfig.links.dashboard },
        { labelKey: "status", href: siteConfig.links.status },
      ],
    },
    {
      titleKey: "resources",
      links: [
        { labelKey: "docs", href: docsUrl("/introduction", locale) },
        { labelKey: "support", href: siteConfig.links.support },
        { labelKey: "github", href: siteConfig.links.github },
        { labelKey: "contact", href: siteConfig.links.email },
      ],
    },
    {
      titleKey: "legal",
      links: [
        { labelKey: "terms", href: docsUrl("/legal/tos", locale) },
        { labelKey: "privacy", href: docsUrl("/legal/privacy", locale) },
        { labelKey: "license", href: docsUrl("/legal/license", locale) },
      ],
    },
  ] as const satisfies {
    titleKey: "product" | "resources" | "legal"
    links: FooterLink[]
  }[]
}

function Footer() {
  const t = useTranslations("common.footer")
  const locale = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface text-surface-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <LogoMark className="size-6 text-brand" />
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
          {getColumns(locale).map((column) => (
            <nav
              key={column.titleKey}
              aria-label={t(column.titleKey)}
              className="flex flex-col gap-3"
            >
              <h2 className="text-xs font-medium">{t(column.titleKey)}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link: FooterLink) => (
                  <li key={link.labelKey}>
                    {link.internal ? (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t(link.labelKey)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>{t("copyright", { year })}</p>
            <p>{t("notAffiliated")}</p>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSelect />
            <ThemeToggleGroup />
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
