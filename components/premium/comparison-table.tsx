import { useLocale, useTranslations } from "next-intl"

import { ArrowOutwardIcon, CheckIcon, RemoveIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { docsUrl } from "@/lib/site-config"

/**
 * Free vs Moddy Max, row for row from docs.moddy.app/premium/features.
 * `true` / `false` render ✓ / ✗, `text` points to a message.
 */
const groups = [
  {
    id: null,
    rows: [
      {
        id: "servers",
        free: { text: "rows.servers.free" },
        max: { text: "rows.servers.max" },
      },
    ],
  },
  {
    id: "customization",
    rows: [
      { id: "identity", free: false, max: true },
      { id: "nameStyle", free: true, max: true },
    ],
  },
  {
    id: "notifications",
    rows: [
      {
        id: "accounts",
        free: { text: "rows.accounts.free" },
        max: { text: "rows.accounts.max" },
      },
      {
        id: "youtube",
        free: { text: "rows.youtube.free" },
        max: { text: "rows.youtube.max" },
      },
      {
        id: "twitch",
        free: { text: "rows.twitch.free" },
        max: { text: "rows.twitch.max" },
      },
      {
        id: "rss",
        free: { text: "rows.rss.free" },
        max: { text: "rows.rss.max" },
      },
      {
        id: "bluesky",
        free: { text: "rows.bluesky.free" },
        max: { text: "rows.bluesky.max" },
      },
    ],
  },
  {
    id: "everywhere",
    rows: [
      {
        id: "automod",
        free: { text: "rows.automod.free", check: true },
        max: { text: "rows.automod.max", check: true },
      },
      { id: "cases", free: true, max: true },
      { id: "welcome", free: true, max: true },
      { id: "utilities", free: true, max: true },
    ],
  },
] as const

type Group = (typeof groups)[number]
type Value = Group["rows"][number]["free" | "max"]

const valueCell = "px-2 py-4 text-center whitespace-normal sm:px-3"

function ComparisonTable() {
  const t = useTranslations("premium.comparison")
  const locale = useLocale()

  return (
    <div className="flex flex-col items-center gap-10">
      <Table className="table-fixed">
        <TableCaption className="sr-only">{t("caption")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[46%] sm:w-1/2">
              <span className="sr-only">{t("feature")}</span>
            </TableHead>
            <TableHead className="px-2 text-center sm:px-3">
              {t("free")}
            </TableHead>
            <TableHead className="px-2 text-center sm:px-3">
              {t("max")}
            </TableHead>
          </TableRow>
        </TableHeader>
        {groups.map((group) => (
          <TableBody key={group.id ?? "plan"}>
            {group.id && (
              <TableRow>
                <TableHead
                  scope="rowgroup"
                  colSpan={3}
                  className="h-auto pt-8 pb-3"
                >
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t(`groups.${group.id}`)}
                  </span>
                </TableHead>
              </TableRow>
            )}
            {group.rows.map((row) => (
              <TableRow key={row.id}>
                <TableHead
                  scope="row"
                  className="h-auto py-4 font-normal whitespace-normal"
                >
                  {t(`rows.${row.id}.label`)}
                </TableHead>
                <TableCell className={valueCell}>
                  <ComparisonValue value={row.free} />
                </TableCell>
                <TableCell className={valueCell}>
                  <ComparisonValue value={row.max} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        ))}
      </Table>
      <Button asChild variant="outline">
        <a href={docsUrl("/premium/features", locale)}>
          {t("docs")}
          <ArrowOutwardIcon data-icon="inline-end" />
        </a>
      </Button>
    </div>
  )
}

function ComparisonValue({ value }: { value: Value }) {
  const t = useTranslations("premium.comparison")

  // Same height for icons and text (min-h-5 = one line), so rows line up.
  return (
    <span className="flex min-h-5 flex-col items-center justify-center gap-1">
      {typeof value === "boolean" ? (
        <>
          {value ? (
            <CheckIcon className="size-5 text-brand" />
          ) : (
            <RemoveIcon className="size-5 text-muted-foreground" />
          )}
          <span className="sr-only">
            {value ? t("included") : t("notIncluded")}
          </span>
        </>
      ) : (
        <>
          {"check" in value && <CheckIcon className="size-5 text-brand" />}
          <span className="tabular-nums">{t(value.text)}</span>
        </>
      )}
    </span>
  )
}

export { ComparisonTable }
