"use client"

import * as React from "react"
import { useFormatter, useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"

const TYPING_MS = 1400

/**
 * The footer signature: a Discord message sent by Moddy, carrying the brand
 * baseline. When the footer scrolls into view, "Moddy is typing…" shows for a
 * moment, then the message lands. The message is always in the DOM (SEO,
 * screen readers, no-JS); the sequence only toggles a data attribute.
 */
function FooterMessage() {
  const t = useTranslations("common.footer")
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const rect = element.getBoundingClientRect()
    if (reduceMotion || rect.top < window.innerHeight) return

    let timeout: number | undefined
    element.dataset.phase = "waiting"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        element.dataset.phase = "typing"
        timeout = window.setTimeout(() => {
          element.dataset.phase = "sent"
        }, TYPING_MS)
      },
      { threshold: 0.6 }
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
      element.dataset.phase = "sent"
    }
  }, [])

  return (
    <div ref={ref} data-phase="sent" className="group/signature relative">
      <Marker className="absolute inset-y-0 left-0 hidden text-xs group-data-[phase=typing]/signature:flex">
        <MarkerContent className="shimmer">{t("typing")}</MarkerContent>
      </Marker>
      <Message
        align="start"
        className="gap-3 transition-[opacity,translate] duration-500 ease-out group-data-[phase=typing]/signature:translate-y-1 group-data-[phase=typing]/signature:opacity-0 group-data-[phase=waiting]/signature:translate-y-1 group-data-[phase=waiting]/signature:opacity-0"
      >
        <MessageAvatar className="self-start">
          <Avatar>
            <AvatarImage src="/brand/moddy-avatar.svg" alt={t("author")} />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-0.5">
          <MessageHeader className="gap-1.5 px-0">
            <span className="text-foreground">{t("author")}</span>
            <Badge>{t("appBadge")}</Badge>
            <MessageTime />
          </MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>{t("baseline")}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  )
}

/** Discord-style timestamp in the visitor's own time zone, e.g. "Today at 14:32". */
function MessageTime() {
  const t = useTranslations("common.footer")
  const format = useFormatter()
  const minute = React.useSyncExternalStore(
    subscribeToMinutes,
    () => Math.floor(Date.now() / 60_000),
    () => null
  )

  if (minute === null) return null
  const date = new Date(minute * 60_000)

  return (
    <time dateTime={date.toISOString()} className="font-normal">
      <span aria-hidden="true">· </span>
      {t("today", {
        time: format.dateTime(date, { hour: "numeric", minute: "2-digit" }),
      })}
    </time>
  )
}

function subscribeToMinutes(callback: () => void) {
  const interval = window.setInterval(callback, 15_000)
  return () => window.clearInterval(interval)
}

export { FooterMessage }
