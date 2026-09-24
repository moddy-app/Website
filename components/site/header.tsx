import { useTranslations } from "next-intl"

import { HeaderShell } from "@/components/site/header-shell"
import { LocaleMenu } from "@/components/site/locale-switcher"
import { Logo } from "@/components/site/logo"
import { MainNav } from "@/components/site/main-nav"
import { MobileNav } from "@/components/site/mobile-nav"
import { ThemeMenu } from "@/components/site/theme-switcher"
import { SessionProvider, UserMenu } from "@/components/site/user-menu"
import { Link } from "@/i18n/navigation"

function Header() {
  const t = useTranslations("common.nav")

  return (
    <SessionProvider>
      <HeaderShell>
        <Link
          href="/"
          className="flex w-fit items-center rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Logo className="-ml-1 h-8 w-auto" />
          <span className="sr-only">{t("home")}</span>
        </Link>
        <MainNav className="hidden md:flex" />
        <div className="flex items-center justify-end gap-1">
          <div className="hidden items-center gap-1 md:flex">
            <LocaleMenu />
            <ThemeMenu />
          </div>
          <div className="flex min-w-8 justify-end pl-1">
            <UserMenu />
          </div>
          <MobileNav />
        </div>
      </HeaderShell>
    </SessionProvider>
  )
}

export { Header }
