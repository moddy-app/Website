import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowForwardIcon, ArrowOutwardIcon } from "@/components/icons"
import { AltGuardMock, AssistantMock } from "@/components/home/product-mocks"
import { Section } from "@/components/site/section"
import { Link } from "@/i18n/navigation"
import { siteConfig } from "@/lib/site-config"

function Bento({ moduleCount }: { moduleCount: number }) {
  const t = useTranslations("home.bento")

  return (
    <Section tone="surface" aria-label={t("title")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="reveal gap-0 overflow-hidden pb-0 md:col-span-2 md:grid md:grid-cols-[1fr_1.1fr] md:py-0">
          <CardHeader className="gap-6 md:self-center md:py-12 md:pl-10">
            <h3 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
              {t("dashboard.title")}
            </h3>
            <Button asChild variant="outline" className="w-fit">
              <a href={siteConfig.links.dashboard}>
                {t("dashboard.cta")}
                <ArrowOutwardIcon data-icon="inline-end" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="relative mt-10 h-72 overflow-hidden px-0 md:mt-0 md:h-auto md:min-h-96">
            <div className="absolute inset-x-6 top-0 md:inset-x-auto md:top-12 md:left-4">
              <AltGuardMock className="w-full md:w-[25rem]" />
            </div>
          </CardContent>
        </Card>

        <Card
          variant="primary"
          className="min-h-80 reveal justify-between md:min-h-[34rem]"
        >
          <CardHeader>
            <h3 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
              {t("modules.title", { count: moduleCount })}
            </h3>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="secondary">
              <Link href="/modules">
                {t("modules.cta")}
                <ArrowForwardIcon data-icon="inline-end" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="min-h-[34rem] reveal gap-0 overflow-hidden pb-0">
          <CardHeader>
            <h3 className="font-heading text-3xl leading-tight font-semibold tracking-tight whitespace-pre-line sm:text-4xl">
              {t("assistant.title")}
            </h3>
          </CardHeader>
          <CardContent className="relative mt-8 flex flex-1 justify-center overflow-hidden px-0">
            <div className="absolute top-0">
              <AssistantMock />
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}

export { Bento }
