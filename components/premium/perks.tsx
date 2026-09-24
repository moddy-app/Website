import { useTranslations } from "next-intl"

import {
  BrushIcon,
  DnsIcon,
  NotificationsIcon,
  type Icon,
} from "@/components/icons"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const perks = [
  { id: "servers", icon: DnsIcon },
  { id: "customization", icon: BrushIcon },
  { id: "notifications", icon: NotificationsIcon },
] as const satisfies { id: string; icon: Icon }[]

/** The three things Moddy Max adds, from docs.moddy.app/premium/overview. */
function PremiumPerks() {
  const t = useTranslations("premium.perks")

  return (
    <ul className="grid gap-4 lg:grid-cols-3">
      {perks.map(({ id, icon: Icon }) => (
        <li key={id} className="flex">
          <Card className="w-full">
            <CardHeader className="gap-3 sm:max-lg:grid-cols-[auto_1fr] sm:max-lg:gap-x-5">
              <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand sm:max-lg:row-span-2 sm:max-lg:mb-0">
                <Icon className="size-6" />
              </span>
              <CardTitle>
                <h3>{t(`${id}.title`)}</h3>
              </CardTitle>
              <CardDescription>{t(`${id}.description`)}</CardDescription>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export { PremiumPerks }
