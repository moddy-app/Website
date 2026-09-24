import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"

import { ArrowOutwardIcon, DiscordIcon } from "@/components/icons"
import { ModuleGroupSection } from "@/components/modules/module-group-section"
import { Section, SectionHeader } from "@/components/site/section"
import { Button } from "@/components/ui/button"
import { routing } from "@/i18n/routing"
import { resolveLocale } from "@/i18n/server"
import { getAlternates } from "@/lib/metadata"
import { moduleGroups } from "@/lib/modules"
import { installUrl, siteConfig } from "@/lib/site-config"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/modules">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "modules.meta" })

  return {
    title: t("title"),
    description: t("description"),
    alternates: getAlternates("/modules", locale),
  }
}

export default async function ModulesPage({
  params,
}: PageProps<"/[locale]/modules">) {
  const locale = await resolveLocale(params)
  const t = await getTranslations("modules")

  return (
    <>
      <Section className="pb-0 sm:pb-0">
        <div className="flex flex-col items-center gap-8">
          <SectionHeader
            as="h1"
            eyebrow={t("hero.eyebrow")}
            title={t("hero.title")}
            description={t.rich("hero.description", {
              code: (chunks) => (
                <code className="font-mono text-[0.9em] text-foreground">
                  {chunks}
                </code>
              ),
            })}
          />
          <nav aria-label={t("nav.label")}>
            <ul className="flex flex-wrap justify-center gap-2">
              {moduleGroups.map((group) => (
                <li key={group}>
                  <Button asChild variant="secondary" size="sm">
                    <a href={`#${group}`}>{t(`groups.${group}.name`)}</a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>

      {moduleGroups.map((group, index) => (
        <ModuleGroupSection
          key={group}
          group={group}
          locale={locale}
          tone={index % 2 === 0 ? "default" : "surface"}
        />
      ))}

      <Section>
        <div className="flex flex-col items-center gap-8">
          <SectionHeader
            title={t("cta.title")}
            description={t("cta.description")}
          />
          <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Button asChild size="lg">
              <a href={installUrl("modules")}>
                <DiscordIcon data-icon="inline-start" />
                {t("cta.install")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={siteConfig.links.dashboard}>
                {t("cta.dashboard")}
                <ArrowOutwardIcon data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
