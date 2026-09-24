import { getTranslations } from "next-intl/server"

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { FooterMessage } from "@/components/site/footer-message"
import { LocaleSelect } from "@/components/site/locale-switcher"
import { ThemeToggleGroup } from "@/components/site/theme-switcher"
import { getServiceStatus, type ServiceStatus } from "@/lib/api"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const statusLabel = {
  operational: "operational",
  degraded: "degraded",
  downtime: "degraded",
  maintenance: "maintenance",
} as const satisfies Record<ServiceStatus["state"], string>

async function Footer() {
  const t = await getTranslations("common.footer")
  const status = await getServiceStatus()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface text-surface-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 pt-20 pb-10 sm:pt-28">
        <FooterMessage>
          {status && (
            <Marker>
              <MarkerIcon className="flex items-center justify-center">
                <span className="relative flex size-2">
                  {status.state === "operational" && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      status.state === "operational"
                        ? "bg-success"
                        : "bg-destructive"
                    )}
                  />
                </span>
              </MarkerIcon>
              <MarkerContent>
                <a href={siteConfig.links.status}>
                  {t(`status.${statusLabel[status.state]}`)}
                </a>
              </MarkerContent>
            </Marker>
          )}
        </FooterMessage>
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year })}
            <span aria-hidden="true"> · </span>
            {t("notAffiliated")}
          </p>
          <div className="flex items-center gap-2">
            <LocaleSelect />
            <ThemeToggleGroup />
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
