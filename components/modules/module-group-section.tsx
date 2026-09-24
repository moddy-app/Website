import { useTranslations } from "next-intl"

import { ModuleCard } from "@/components/modules/module-card"
import { Section, SectionHeader } from "@/components/site/section"
import type { Locale } from "@/i18n/routing"
import { getModulesByGroup, type ModuleGroup } from "@/lib/modules"
import { cn } from "@/lib/utils"

/**
 * Column spans that keep every row full, whatever the number of cards:
 * - lg (6 columns): rows of three (span 2); when the count is not a multiple
 *   of three, the first cards go two per row (span 3) instead.
 * - sm (2 columns): with an odd count, the first card takes the whole row.
 */
function getSpanClassName(index: number, count: number) {
  const remainder = count % 3
  const wideCount = remainder === 0 ? 0 : remainder === 2 ? 2 : 4

  return cn(
    index < wideCount ? "lg:col-span-3" : "lg:col-span-2",
    count % 2 === 1 && index === 0 && "sm:col-span-2"
  )
}

function ModuleGroupSection({
  group,
  locale,
  tone,
}: {
  group: ModuleGroup
  locale: Locale
  tone: "default" | "surface"
}) {
  const t = useTranslations("modules.groups")
  const items = getModulesByGroup(group)

  return (
    <Section id={group} tone={tone}>
      <SectionHeader
        align="start"
        eyebrow={t(`${group}.name`)}
        title={t(`${group}.title`)}
        description={t(`${group}.description`)}
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn("flex", getSpanClassName(index, items.length))}
          >
            <ModuleCard item={item} locale={locale} className="flex-1" />
          </li>
        ))}
      </ul>
    </Section>
  )
}

export { ModuleGroupSection }
