"use client"

import * as React from "react"
import { ComputerIcon, DarkModeIcon, LightModeIcon } from "@/components/icons"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const themes = [
  { value: "light", icon: LightModeIcon },
  { value: "dark", icon: DarkModeIcon },
  { value: "system", icon: ComputerIcon },
] as const

/** next-themes only knows the theme once mounted in the browser. */
function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

/** Compact icon menu, used in the header. */
function ThemeMenu() {
  const t = useTranslations("common.theme")
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <LightModeIcon className="dark:hidden" />
          <DarkModeIcon className="hidden dark:block" />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mounted ? theme : undefined}
          onValueChange={setTheme}
        >
          {themes.map(({ value, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {t(value)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Segmented control, used in the footer and the mobile menu. */
function ThemeToggleGroup() {
  const t = useTranslations("common.theme")
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={mounted ? theme : ""}
      onValueChange={(value) => value && setTheme(value)}
      aria-label={t("label")}
    >
      {themes.map(({ value, icon: Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={t(value)}>
          <Icon />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { ThemeMenu, ThemeToggleGroup }
