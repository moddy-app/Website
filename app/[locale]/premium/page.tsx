import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ActivationSteps } from "@/components/premium/activation-steps"
import { CheckoutStatus } from "@/components/premium/checkout-status"
import { ComparisonTable } from "@/components/premium/comparison-table"
import { PremiumPerks } from "@/components/premium/perks"
import { PlanPicker } from "@/components/premium/plan-picker"
import { Section, SectionHeader } from "@/components/site/section"
import { resolveLocale } from "@/i18n/server"
import { getAlternates } from "@/lib/metadata"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/premium">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: "premium.meta" })

  return {
    title: t("title"),
    description: t("description"),
    alternates: getAlternates("/premium", locale),
  }
}

export default async function PremiumPage({
  params,
}: PageProps<"/[locale]/premium">) {
  await resolveLocale(params)
  const t = await getTranslations("premium")

  return (
    <>
      <Section>
        <CheckoutStatus className="mx-auto max-w-md" />
        <SectionHeader
          as="h1"
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
        />
        <PlanPicker className="mx-auto" />
      </Section>
      <Section tone="surface">
        <SectionHeader
          title={t("perks.title")}
          description={t("perks.description")}
        />
        <PremiumPerks />
      </Section>
      <Section>
        <SectionHeader
          title={t("comparison.title")}
          description={t("comparison.description")}
        />
        <ComparisonTable />
      </Section>
      <Section tone="surface">
        <ActivationSteps />
      </Section>
    </>
  )
}
