"use client"

import { useTranslations } from "next-intl"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { mainNav } from "@/lib/navigation"

function MainNav({ className }: { className?: string }) {
  const t = useTranslations("common.nav")
  const pathname = usePathname()

  return (
    <NavigationMenu
      viewport={false}
      aria-label={t("label")}
      className={className}
    >
      <NavigationMenuList>
        {mainNav.map((item) => {
          const active = !item.external && pathname.startsWith(item.href)
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                active={active}
                className={navigationMenuTriggerStyle()}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    {...(item.labelKey === "support"
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {t(item.labelKey)}
                  </a>
                ) : (
                  <Link href={item.href}>{t(item.labelKey)}</Link>
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export { MainNav }
