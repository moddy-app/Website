import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ArrowForwardIcon, DiscordIcon } from "@/components/icons"
import { Section, SectionHeader } from "@/components/site/section"
import { Link } from "@/i18n/navigation"

function ClosingCta() {
  const t = useTranslations("home.cta")

  return (
    <Section className="pt-0 sm:pt-0">
      <div className="flex flex-col items-center gap-8">
        <SectionHeader title={t("title")} description={t("description")} />
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="/install?utm_medium=website&utm_content=closing">
              <DiscordIcon data-icon="inline-start" />
              {t("primary")}
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/modules">
              {t("secondary")}
              <ArrowForwardIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  )
}

export { ClosingCta }
