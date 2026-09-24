"use client"

import * as React from "react"
import {
  CheckCircleIcon,
  InfoIcon,
  MegaphoneIcon,
  WarningCircleIcon,
  WarningIcon,
  WrenchIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react"
import { useTranslations } from "next-intl"

import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"

/**
 * Site-wide banner. The live status from health.moddy.app wins (incident,
 * degraded performance, maintenance); otherwise the banner published by the
 * staff through `GET /banners/active` is shown. Polled every minute, and a
 * dismissal is remembered for the browser session.
 */

const POLL_MS = 60_000
const DISMISS_KEY = "moddy:banner-dismissed"

type HealthBanner = {
  level: string
  title: string | null
  url: string | null
  message: string | null
}

type StaffBanner = {
  id: number
  message: string
  type: string | null
  icon_svg: string | null
  color: string | null
  show_website: boolean
  is_active: boolean
}

type Banner = {
  id: string
  message: string
  url: string | null
  icon: Icon | null
  iconSvg: string | null
  destructive: boolean
}

const typeIcons: Record<string, { icon: Icon; destructive: boolean }> = {
  announcement: { icon: MegaphoneIcon, destructive: false },
  information: { icon: InfoIcon, destructive: false },
  maintenance: { icon: WrenchIcon, destructive: false },
  resolved: { icon: CheckCircleIcon, destructive: false },
  warning: { icon: WarningIcon, destructive: true },
  incident: { icon: WarningCircleIcon, destructive: true },
  degraded_performance: { icon: WarningIcon, destructive: true },
  partial_outage: { icon: WarningCircleIcon, destructive: true },
  major_outage: { icon: WarningCircleIcon, destructive: true },
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" })
    return response.ok ? ((await response.json()) as T) : null
  } catch {
    return null
  }
}

async function fetchBanner(): Promise<Banner | null> {
  const health = await fetchJson<HealthBanner>(
    `${siteConfig.healthUrl}/v1/status/banner?service=${siteConfig.healthServiceId}`
  )
  if (health && health.level !== "operational" && health.message) {
    const config = typeIcons[health.level] ?? typeIcons.partial_outage
    return {
      id: `status:${health.url ?? health.level}`,
      message: health.message,
      url: health.url,
      icon: config.icon,
      iconSvg: null,
      destructive: config.destructive,
    }
  }

  const staff = await fetchJson<StaffBanner | null>(
    `${siteConfig.apiUrl}/banners/active`
  )
  if (!staff || !staff.is_active || !staff.show_website || !staff.message) {
    return null
  }
  const config = staff.type ? typeIcons[staff.type] : undefined
  return {
    id: String(staff.id),
    message: staff.message,
    url: null,
    icon: config?.icon ?? (staff.icon_svg ? null : InfoIcon),
    iconSvg: staff.type ? null : staff.icon_svg,
    destructive: config?.destructive ?? false,
  }
}

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY)
  } catch {
    return null
  }
}

function StatusBanner() {
  const t = useTranslations("common.banner")
  const [banner, setBanner] = React.useState<Banner | null>(null)
  const [dismissed, setDismissed] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    const load = () =>
      fetchBanner().then((next) => {
        if (cancelled) return
        setDismissed(readDismissed())
        setBanner(next)
      })

    load()
    const interval = window.setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  if (!banner || banner.id === dismissed) return null

  const Icon = banner.icon

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pt-3 sm:px-4">
      <Alert
        variant={banner.destructive ? "destructive" : "default"}
        className="animate-in duration-500 fade-in-0 slide-in-from-top-2"
      >
        {Icon ? (
          <Icon weight="fill" />
        ) : banner.iconSvg ? (
          // Rendered as an image so a custom SVG can never run scripts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(banner.iconSvg)}`}
            alt=""
            className="size-4 translate-y-0.5"
          />
        ) : null}
        <AlertTitle>
          <InlineMarkdown text={banner.message} />
          {banner.url && (
            <>
              {" "}
              <a href={banner.url} target="_blank" rel="noopener noreferrer">
                {t("details")}
              </a>
            </>
          )}
        </AlertTitle>
        <AlertAction>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              try {
                sessionStorage.setItem(DISMISS_KEY, banner.id)
              } catch {}
              setDismissed(banner.id)
            }}
          >
            <XIcon />
            <span className="sr-only">{t("dismiss")}</span>
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}

/**
 * Tiny Markdown subset used by banners: **bold**, *italic*, `code` and
 * [links](https://…). Built as React nodes, so nothing is injected as HTML.
 */
function InlineMarkdown({ text }: { text: string }) {
  const pattern =
    /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  const nodes: React.ReactNode[] = []
  let last = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    const [, bold, italic, code, label, href] = match
    if (bold) nodes.push(<strong key={index}>{bold}</strong>)
    else if (italic) nodes.push(<em key={index}>{italic}</em>)
    else if (code)
      nodes.push(
        <code key={index} className="font-mono">
          {code}
        </code>
      )
    else if (label && href)
      nodes.push(
        <a key={index} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      )
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))

  return <>{nodes}</>
}

export { StatusBanner }
