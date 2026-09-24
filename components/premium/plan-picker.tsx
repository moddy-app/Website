"use client"

import * as React from "react"
import { useFormatter, useLocale, useTranslations } from "next-intl"

import { CheckIcon, ErrorIcon } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getPathname } from "@/i18n/navigation"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

import { createCheckout } from "./checkout"
import {
  DEFAULT_PLAN,
  getYearlyMonthlyEquivalent,
  getYearlySaving,
  isPlan,
  MODDY_MAX_PRICING,
  type Plan,
} from "./pricing"
import { useSearchParam } from "./use-search-param"

type CheckoutState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "error"; reason: "blocked" | "generic" }

const features = ["servers", "customization", "notifications"] as const

/** Moddy Max pricing card: plan choice and Stripe checkout. */
function PlanPicker({ className }: { className?: string }) {
  const t = useTranslations("premium.plans")
  const format = useFormatter()
  const locale = useLocale()
  // `?plan=` is set when the visitor comes back from signing in.
  const planFromUrl = useSearchParam("plan")
  const [chosenPlan, setChosenPlan] = React.useState<Plan | null>(null)
  const plan = chosenPlan ?? (isPlan(planFromUrl) ? planFromUrl : DEFAULT_PLAN)
  const [checkout, setCheckout] = React.useState<CheckoutState>({
    status: "idle",
  })
  const pending = checkout.status === "pending"

  // Going back from Stripe restores this page from the back/forward cache,
  // still showing the spinner: reset it.
  React.useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setCheckout({ status: "idle" })
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  const formatPrice = (amount: number) =>
    format.number(amount, {
      style: "currency",
      currency: MODDY_MAX_PRICING.currency,
    })
  const saving = getYearlySaving()

  async function subscribe() {
    setCheckout({ status: "pending" })
    const returnUrl = new URL(
      getPathname({ href: "/premium", locale }),
      window.location.origin
    ).toString()
    const result = await createCheckout(plan, returnUrl)

    if (result.type === "redirect" || result.type === "login") {
      window.location.assign(result.url)
    } else {
      setCheckout({
        status: "error",
        reason: result.type === "blocked" ? "blocked" : "generic",
      })
    }
  }

  return (
    <Card id="plans" className={cn("w-full max-w-md scroll-mt-24", className)}>
      <CardHeader>
        <CardTitle>
          <h2>{t("title")}</h2>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          spacing={0}
          value={plan}
          onValueChange={(value) => {
            if (!isPlan(value)) return
            setChosenPlan(value)
            if (checkout.status === "error") setCheckout({ status: "idle" })
          }}
          disabled={pending}
          aria-label={t("billingPeriod")}
          className="w-full"
        >
          <ToggleGroupItem value="monthly" className="flex-1">
            {t("monthly")}
          </ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="flex-1">
            {t("yearly")}
            {saving >= 0.01 && (
              <Badge>
                {t("saving", {
                  percent: format.number(saving, {
                    style: "percent",
                    maximumFractionDigits: 0,
                  }),
                })}
              </Badge>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
        <div aria-live="polite" className="flex flex-col gap-1">
          <p className="flex flex-wrap items-baseline gap-x-1">
            <span className="font-heading text-5xl font-semibold tracking-tight tabular-nums">
              {formatPrice(MODDY_MAX_PRICING[plan])}
            </span>
            <span className="text-base text-muted-foreground">
              {plan === "yearly" ? t("perYear") : t("perMonth")}
            </span>
          </p>
          <p className="text-muted-foreground">
            {plan === "yearly"
              ? t("billedYearly", {
                  price: formatPrice(getYearlyMonthlyEquivalent()),
                })
              : t("billedMonthly")}
          </p>
        </div>
        <Separator />
        <ul className="flex flex-col gap-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckIcon className="size-5 shrink-0 text-brand" />
              <span>{t(`features.${feature}`)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        {checkout.status === "error" && (
          <CheckoutError reason={checkout.reason} />
        )}
        <Button size="lg" disabled={pending} onClick={subscribe}>
          {pending && <Spinner data-icon="inline-start" />}
          {pending ? t("redirecting") : t("subscribe")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("secure")}
        </p>
      </CardFooter>
    </Card>
  )
}

function CheckoutError({ reason }: { reason: "blocked" | "generic" }) {
  const t = useTranslations("premium.checkout")

  return (
    <Alert
      variant="destructive"
      className="animate-in duration-300 fade-in-0 slide-in-from-bottom-1"
    >
      <ErrorIcon />
      {reason === "blocked" ? (
        <>
          <AlertTitle>{t("blocked.title")}</AlertTitle>
          <AlertDescription>
            {t.rich("blocked.description", {
              link: (chunks) => (
                <a
                  href={siteConfig.links.support}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </AlertDescription>
        </>
      ) : (
        <>
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription>{t("error.description")}</AlertDescription>
        </>
      )}
    </Alert>
  )
}

export { PlanPicker }
