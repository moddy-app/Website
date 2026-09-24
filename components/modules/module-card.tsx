import { useTranslations } from "next-intl"

import { ArrowOutwardIcon, WorkspacePremiumIcon } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import type { Module } from "@/lib/modules"
import { docsUrl } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * One module tile. The whole card is clickable: the "Learn more" link is
 * stretched over it, and the optional badge link sits above that layer.
 */
function ModuleCard({
  item,
  locale,
  className,
}: {
  item: Module
  locale: Locale
  className?: string
}) {
  const t = useTranslations("modules")
  const Icon = item.icon
  const name = t(`items.${item.id}.name`)

  return (
    <Card className={cn("relative", className)}>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon className="size-5" />
          </span>
          {item.tag === "premium" && (
            <Badge asChild className="relative z-10">
              <Link href="/premium">
                <WorkspacePremiumIcon data-icon="inline-start" />
                {t("card.premium")}
              </Link>
            </Badge>
          )}
          {item.tag === "paused" && (
            <Badge variant="secondary">{t("card.paused")}</Badge>
          )}
        </div>
        <CardTitle>
          <h3>{name}</h3>
        </CardTitle>
        <CardDescription>{t(`items.${item.id}.description`)}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <a
          href={docsUrl(item.docsPath, locale)}
          aria-label={t("card.learnMoreAbout", { name })}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 outline-none group-hover/card:underline after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
        >
          {t("card.learnMore")}
          <ArrowOutwardIcon className="size-4 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
        </a>
      </CardFooter>
    </Card>
  )
}

export { ModuleCard }
