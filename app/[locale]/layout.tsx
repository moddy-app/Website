import type { Metadata, Viewport } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"
import { StatusBanner } from "@/components/site/status-banner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { routing } from "@/i18n/routing"
import { resolveLocale } from "@/i18n/server"
import { fontMono, fontSans } from "@/lib/fonts"
import { getAlternates } from "@/lib/metadata"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "common.meta" })

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: siteConfig.name,
    alternates: getAlternates("/", locale),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t("title"),
      description: t("description"),
      locale,
    },
    twitter: { card: "summary_large_image" },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params)
  const t = await getTranslations("common")

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(fontSans.variable, fontMono.variable)}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <TooltipProvider>
              <a
                href="#content"
                className="sr-only rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
              >
                {t("skipToContent")}
              </a>
              <div className="relative flex min-h-svh flex-col">
                <Header />
                <StatusBanner />
                <main id="content" className="flex flex-1 flex-col">
                  {children}
                </main>
                <Footer />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
