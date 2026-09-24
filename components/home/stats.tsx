import { useTranslations } from "next-intl"

import { Card, CardContent } from "@/components/ui/card"
import { StatNumber } from "@/components/home/stat-number"
import { Section, SectionHeader } from "@/components/site/section"
import type { PublicStats, ServiceStatus } from "@/lib/api"
import { siteConfig } from "@/lib/site-config"

type Tile = {
  key: string
  variant: "default" | "primary" | "inverted"
  value: number
  options?: Intl.NumberFormatOptions
  label: string
}

const COMPACT_FROM = 10_000

function countOptions(value: number): Intl.NumberFormatOptions {
  return value >= COMPACT_FROM
    ? { notation: "compact", maximumFractionDigits: 1 }
    : { maximumFractionDigits: 0 }
}

function Stats({
  stats,
  status,
}: {
  stats: PublicStats | null
  status: ServiceStatus | null
}) {
  const t = useTranslations("home.stats")

  const tiles: Tile[] = [
    {
      key: "languages",
      variant: "default",
      value: siteConfig.botLanguages.length,
      label: t("languages.label"),
    },
    ...(stats
      ? ([
          {
            key: "users",
            variant: "inverted",
            value: stats.users,
            options: countOptions(stats.users),
            label: t("users.label"),
          },
          {
            key: "servers",
            variant: "inverted",
            value: stats.guilds,
            options: countOptions(stats.guilds),
            label: t("servers.label"),
          },
        ] satisfies Tile[])
      : []),
    ...(status?.botAvailability != null
      ? ([
          {
            key: "uptime",
            variant: "primary",
            value: status.botAvailability,
            options: {
              style: "percent",
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            },
            label: t("uptime.label"),
          },
        ] satisfies Tile[])
      : []),
  ]

  return (
    <Section>
      <SectionHeader title={t("title")} />
      <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <Card
            key={tile.key}
            variant={tile.variant}
            className="aspect-[4/5] reveal justify-end sm:aspect-[5/6]"
          >
            <CardContent className="flex flex-col gap-2">
              <p className="font-heading text-4xl leading-none font-semibold tracking-tight sm:text-6xl">
                <StatNumber value={tile.value} options={tile.options} />
              </p>
              <p className="text-base leading-snug font-medium text-balance sm:text-xl">
                {tile.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export { Stats }
