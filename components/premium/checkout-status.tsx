"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { CheckCircleIcon, CloseIcon, InfoIcon } from "@/components/icons"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

import { useSearchParam } from "./use-search-param"

/** Stripe sends the visitor back with `?premium=success` or `?premium=cancel`. */
function CheckoutStatus({ className }: { className?: string }) {
  const t = useTranslations("premium.checkout")
  const status = useSearchParam("premium")
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed || (status !== "success" && status !== "cancel")) return null

  return (
    <Alert
      className={cn(
        "animate-in duration-500 fade-in-0 slide-in-from-top-2",
        className
      )}
    >
      {status === "success" ? <CheckCircleIcon /> : <InfoIcon />}
      <AlertTitle>{t(`${status}.title`)}</AlertTitle>
      <AlertDescription>
        {status === "success"
          ? t.rich("success.description", {
              link: (chunks) => (
                <a href={siteConfig.links.premiumServers}>{chunks}</a>
              ),
            })
          : t("cancel.description")}
      </AlertDescription>
      <AlertAction>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setDismissed(true)}
        >
          <CloseIcon />
          <span className="sr-only">{t("dismiss")}</span>
        </Button>
      </AlertAction>
    </Alert>
  )
}

export { CheckoutStatus }
