import { useTranslations } from "next-intl"

import { ArrowOutwardIcon, InfoIcon } from "@/components/icons"
import { SectionHeader } from "@/components/site/section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/site-config"

const steps = [
  "subscribe",
  "dashboard",
  "premiumServers",
  "select",
  "save",
] as const

/** How to turn premium on for a server, from docs.moddy.app/premium/overview. */
function ActivationSteps() {
  const t = useTranslations("premium.activation")

  const link = {
    plans: (chunks: React.ReactNode) => <a href="#plans">{chunks}</a>,
    dashboard: (chunks: React.ReactNode) => (
      <a href={siteConfig.links.dashboard}>{chunks}</a>
    ),
    code: (chunks: React.ReactNode) => (
      <code className="font-mono">{chunks}</code>
    ),
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col items-start gap-8">
        <SectionHeader
          align="start"
          title={t("title")}
          description={t("description")}
        />
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("note.title")}</AlertTitle>
          <AlertDescription>
            {t.rich("note.description", link)}
          </AlertDescription>
        </Alert>
        <Button asChild size="lg">
          <a href={siteConfig.links.premiumServers}>
            {t("cta")}
            <ArrowOutwardIcon data-icon="inline-end" />
          </a>
        </Button>
      </div>
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li key={step} className="relative flex gap-4 pb-10 last:pb-0">
            {index < steps.length - 1 && (
              <Separator
                orientation="vertical"
                className="absolute top-10 bottom-2 left-4 -translate-x-1/2"
              />
            )}
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground tabular-nums"
            >
              {index + 1}
            </span>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="font-medium">{t(`steps.${step}.title`)}</h3>
              <p className="text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-3">
                {t.rich(`steps.${step}.description`, link)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export { ActivationSteps }
