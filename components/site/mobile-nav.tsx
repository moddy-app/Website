"use client"

import * as React from "react"
import { ArrowUpRightIcon, ListIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LocaleSelect } from "@/components/site/locale-switcher"
import { ThemeToggleGroup } from "@/components/site/theme-switcher"
import { Link } from "@/i18n/navigation"
import { mainNav } from "@/lib/navigation"

function MobileNav() {
  const t = useTranslations("common")
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <ListIcon />
          <span className="sr-only">{t("nav.openMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="rounded-b-3xl">
        <SheetHeader>
          <SheetTitle>{t("nav.menuTitle")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("footer.tagline")}
          </SheetDescription>
        </SheetHeader>
        <nav aria-label={t("nav.label")} className="flex flex-col px-3">
          {mainNav.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="lg"
              className="justify-between"
            >
              {item.external ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {t(`nav.${item.labelKey}`)}
                  <ArrowUpRightIcon data-icon="inline-end" />
                </a>
              ) : (
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {t(`nav.${item.labelKey}`)}
                </Link>
              )}
            </Button>
          ))}
        </nav>
        <Separator className="mx-6 w-auto" />
        <div className="flex items-center justify-between gap-3 p-6">
          <LocaleSelect />
          <ThemeToggleGroup />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
