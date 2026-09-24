import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "@/components/ui/message"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { CheckCircleIcon, ShieldPersonIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

/*
 * Illustrations of the product, built from the real UI components instead of
 * screenshots: always sharp, translated and theme-aware. They are decorative
 * (aria-hidden + inert), the surrounding card carries the message.
 */

/** The AltGuard settings panel of the web dashboard. */
function AltGuardMock({ className }: { className?: string }) {
  const t = useTranslations("home.bento.mock.altguard")
  const rows = [
    { label: t("channel"), value: t("channelValue") },
    { label: t("unverified"), value: t("unverifiedValue") },
    { label: t("verified"), value: t("verifiedValue") },
    { label: t("logs"), value: t("logsValue") },
  ]

  return (
    <div
      aria-hidden="true"
      inert
      className={cn(
        "flex flex-col gap-4 rounded-3xl bg-background p-5 shadow-2xl ring-1 shadow-foreground/10 ring-foreground/10",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldPersonIcon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-medium">{t("title")}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Switch defaultChecked />
      </div>
      <Separator />
      <ItemGroup className="gap-1">
        {rows.map((row) => (
          <Item key={row.label} size="xs">
            <ItemContent>
              <ItemTitle>{row.label}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Badge variant="secondary">{row.value}</Badge>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">
          <CheckCircleIcon data-icon="inline-start" />
          {t("enabled")}
        </Badge>
        <Button size="sm">{t("save")}</Button>
      </div>
    </div>
  )
}

/** A conversation where Moddy configures a module from a plain request. */
function AssistantMock() {
  const t = useTranslations("home.bento.mock.chat")

  return (
    <div
      aria-hidden="true"
      inert
      className="flex w-[17rem] flex-col gap-3 rounded-[2.5rem] bg-background p-4 pt-8 shadow-2xl ring-8 shadow-foreground/10 ring-inverted"
    >
      <MessageGroup className="gap-3">
        <Message align="end">
          <MessageContent>
            <Bubble align="end">
              <BubbleContent>{t("request")}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="start">
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarImage src="/brand/moddy-avatar.svg" alt="" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent className="gap-2">
            <Bubble variant="muted">
              <BubbleContent>{t("proposal")}</BubbleContent>
            </Bubble>
            <Button size="xs" className="w-fit">
              {t("validate")}
            </Button>
          </MessageContent>
        </Message>
      </MessageGroup>
      <Marker className="justify-center">
        <MarkerIcon>
          <CheckCircleIcon />
        </MarkerIcon>
        <MarkerContent>{t("done")}</MarkerContent>
      </Marker>
    </div>
  )
}

export { AltGuardMock, AssistantMock }
