import Image from "next/image"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ArrowForwardIcon } from "@/components/icons"
import { ServerCloud } from "@/components/home/server-cloud"
import type { ShowcaseGuild } from "@/lib/api"

function Hero({
  guilds,
  guildCount,
}: {
  guilds: ShowcaseGuild[]
  guildCount: number | null
}) {
  const t = useTranslations("home.hero")

  return (
    <section className="relative flex flex-col items-center overflow-hidden px-4 pt-10 pb-20 [--tile:2.75rem] sm:px-6 sm:pt-14 sm:pb-28 sm:[--tile:3.25rem] lg:[--tile:3.75rem]">
      <ServerCloud guilds={guilds} />
      <div className="relative mt-8 flex flex-col items-center gap-8 text-center sm:mt-10">
        <Image
          src="/brand/moddy-app-icon.svg"
          alt={t("appIconAlt")}
          width={96}
          height={96}
          priority
          className="size-20 animate-in rounded-[28%] shadow-xl shadow-primary/20 duration-700 fill-mode-both zoom-in-75 fade-in sm:size-24"
        />
        <h1 className="max-w-3xl font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
        <div className="flex flex-col items-center gap-4">
          <Button asChild size="lg">
            <a href="/install?utm_medium=website&utm_content=hero">
              {t("cta")}
              <ArrowForwardIcon data-icon="inline-end" />
            </a>
          </Button>
          {guildCount !== null && guildCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("trustedBy", { count: guildCount })}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export { Hero }
