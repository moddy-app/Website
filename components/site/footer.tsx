import { getTranslations } from "next-intl/server"

import { Separator } from "@/components/ui/separator"
import { FooterMessage } from "@/components/site/footer-message"
import { LocaleSelect } from "@/components/site/locale-switcher"
import { StatusBadge } from "@/components/site/status-badge"
import { ThemeToggleGroup } from "@/components/site/theme-switcher"

/**
 * Deliberately small: a compact Discord message signed by Moddy (the brand
 * baseline), the official status badge, then the legal line and preferences.
 */
async function Footer() {
  const t = await getTranslations("common.footer")
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-10">
        <Separator />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <FooterMessage />
          <StatusBadge title={t("statusTitle")} />
        </div>
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
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
