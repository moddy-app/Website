"use client"

import * as React from "react"
import {
  DiscordLogoIcon,
  SignOutIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { usePathname } from "@/i18n/navigation"
import {
  getDisplayName,
  getLoginUrl,
  getSessionUser,
  signOut,
  type SessionUser,
} from "@/lib/auth"
import { siteConfig } from "@/lib/site-config"
import { getInitials } from "@/lib/utils"

type SessionState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; user: SessionUser }

const subscribeNoop = () => () => {}

const SessionContext = React.createContext<SessionState>({ status: "loading" })

/**
 * Resolves the visitor's session once per page load and shares it with every
 * UserMenu (header and mobile menu), so `/auth/me` is only called once.
 */
function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SessionState>({ status: "loading" })

  React.useEffect(() => {
    const controller = new AbortController()
    getSessionUser(controller.signal).then((user) => {
      if (controller.signal.aborted) return
      setState(user ? { status: "user", user } : { status: "guest" })
    })
    return () => controller.abort()
  }, [])

  return <SessionContext value={state}>{children}</SessionContext>
}

function UserMenu() {
  const t = useTranslations("common.auth")
  const session = React.use(SessionContext)
  // Send the visitor back to the page they were on once signed in.
  usePathname() // Re-render on client-side navigation so the URL stays current.
  const loginUrl = React.useSyncExternalStore(
    subscribeNoop,
    () => getLoginUrl(window.location.href),
    () => getLoginUrl()
  )

  if (session.status === "loading") {
    return (
      <Skeleton className="size-8 rounded-full" aria-label={t("loading")} />
    )
  }

  if (session.status === "guest") {
    return (
      <Button asChild size="sm" className="animate-in duration-300 fade-in-0">
        <a href={loginUrl}>
          <DiscordLogoIcon data-icon="inline-start" weight="fill" />
          {t("signIn")}
        </a>
      </Button>
    )
  }

  const { user } = session
  const name = getDisplayName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="animate-in duration-300 fade-in-0"
        >
          <Avatar>
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">{t("account")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar size="lg">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate">{name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              @{user.username}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href={siteConfig.links.dashboard}>
              <SquaresFourIcon />
              {t("dashboard")}
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onSelect={async () => {
              await signOut()
              window.location.reload()
            }}
          >
            <SignOutIcon />
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { SessionProvider, UserMenu }
