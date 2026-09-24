"use client"

import * as React from "react"
import { LanguageIcon } from "@/components/icons"
import { useLocale, useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"

/** Switches language while staying on the same page. */
function useLocaleSwitch() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()

  const switchLocale = React.useCallback(
    (locale: string) => {
      startTransition(() => {
        router.replace(
          // @ts-expect-error -- params always match the current pathname.
          { pathname, params },
          { locale: locale as Locale, scroll: false }
        )
      })
    },
    [router, pathname, params]
  )

  return { switchLocale, isPending }
}

/** Compact icon menu, used in the header. */
function LocaleMenu() {
  const t = useTranslations("common.locale")
  const locale = useLocale()
  const { switchLocale, isPending } = useLocaleSwitch()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <LanguageIcon />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
          {routing.locales.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l}>
              {t(l)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Labelled select, used in the footer and the mobile menu. */
function LocaleSelect({ id }: { id?: string }) {
  const t = useTranslations("common.locale")
  const locale = useLocale()
  const { switchLocale, isPending } = useLocaleSwitch()

  return (
    <Select value={locale} onValueChange={switchLocale} disabled={isPending}>
      <SelectTrigger id={id} size="sm" aria-label={t("label")}>
        <LanguageIcon />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {routing.locales.map((l) => (
            <SelectItem key={l} value={l} lang={l}>
              {t(l)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { LocaleMenu, LocaleSelect }
