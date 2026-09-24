import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Bento } from "@/components/home/bento"
import { ClosingCta } from "@/components/home/closing-cta"
import { Hero } from "@/components/home/hero"
import { Stats } from "@/components/home/stats"
import { resolveLocale } from "@/i18n/server"
import { getPublicStats, getServiceStatus, getShowcaseGuilds } from "@/lib/api"
import { getAlternates } from "@/lib/metadata"
import { moduleCount } from "@/lib/modules"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: "home.meta" })
  return {
    description: t("description"),
    alternates: getAlternates("/", locale),
  }
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  await resolveLocale(params)
  const [stats, guilds, status] = await Promise.all([
    getPublicStats(),
    getShowcaseGuilds(),
    getServiceStatus(),
  ])

  return (
    <>
      <Hero guilds={guilds} guildCount={stats?.guilds ?? null} />
      <Bento moduleCount={moduleCount} />
      <Stats stats={stats} status={status} />
      <ClosingCta />
    </>
  )
}
