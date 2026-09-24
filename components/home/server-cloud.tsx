import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ConfirmationNumberIcon,
  GavelIcon,
  HubIcon,
  MicIcon,
  NotificationsIcon,
  PaletteIcon,
  ReceiptLongIcon,
  ShieldPersonIcon,
  StarIcon,
  TranslateIcon,
  WavingHandIcon,
  type Icon,
} from "@/components/icons"
import type { ShowcaseGuild } from "@/lib/api"
import { getInitials } from "@/lib/utils"

/*
 * The hero's cloud of server icons, laid out as columns whose height grows
 * toward the center, like a "V" pointing at the Moddy icon below it.
 * Columns are centered and the row is wider than small screens: the edges
 * are clipped and faded instead of shrinking the icons.
 */

/** Icons per column, from the far left to the far right (center = tallest). */
const COLUMNS = [1, 2, 2, 3, 2, 3, 3, 4, 3, 3, 2, 3, 2, 2, 1] as const
/** Vertical offset of each column, in icon units, for an organic silhouette. */
const OFFSETS = [
  1.2, 0.4, 1, 0.2, 0.9, 0.3, 0.7, 0, 0.8, 0.2, 1, 0.3, 0.9, 0.5, 1.3,
] as const

/** Fallback tiles when the showcase is unavailable: Moddy's own modules. */
const FALLBACK_ICONS: Icon[] = [
  ShieldPersonIcon,
  GavelIcon,
  ReceiptLongIcon,
  ConfirmationNumberIcon,
  WavingHandIcon,
  NotificationsIcon,
  HubIcon,
  StarIcon,
  MicIcon,
  PaletteIcon,
  TranslateIcon,
]

type Slot = { column: number; row: number; order: number }

/** Slots sorted from the center outwards, so the biggest servers sit in the middle. */
function getSlots(): Slot[] {
  const center = (COLUMNS.length - 1) / 2
  const slots = COLUMNS.flatMap((count, column) =>
    Array.from({ length: count }, (_, row) => ({ column, row, order: 0 }))
  )
  return slots
    .map((slot) => ({
      ...slot,
      order: Math.abs(slot.column - center) * 10 + slot.row,
    }))
    .sort((a, b) => a.order - b.order)
}

function ServerCloud({ guilds }: { guilds: ShowcaseGuild[] }) {
  const t = useTranslations("home.hero")
  const slots = getSlots()

  const tiles = new Map(
    slots.map((slot, index) => [`${slot.column}:${slot.row}`, index])
  )

  const decorative = guilds.length === 0

  return (
    <div
      role={decorative ? undefined : "list"}
      aria-label={decorative ? undefined : t("showcaseLabel")}
      aria-hidden={decorative || undefined}
      className="flex w-full justify-center gap-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:gap-4"
    >
      {COLUMNS.map((count, column) => (
        <div
          key={column}
          role="none"
          className="flex shrink-0 flex-col gap-3 sm:gap-4"
          style={{ paddingTop: `calc(var(--tile) * ${OFFSETS[column]})` }}
        >
          {Array.from({ length: count }, (_, row) => {
            const index = tiles.get(`${column}:${row}`) ?? 0
            const guild = guilds[index]
            const delay = `${index * 35}ms`
            const float = `${(index % 5) * -1.4}s`

            return (
              <div
                key={row}
                role={decorative ? undefined : "listitem"}
                className="animate-float"
                style={{ animationDelay: float }}
              >
                <div
                  className="animate-in duration-700 ease-out fill-mode-both zoom-in-90 fade-in"
                  style={{ animationDelay: delay }}
                >
                  {guild ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar
                          shape="squircle"
                          role="img"
                          aria-label={guild.name}
                          className="size-(--tile) shadow-sm"
                        >
                          {guild.icon_url && (
                            <AvatarImage
                              src={guild.icon_url.replace(
                                /size=\d+/,
                                "size=128"
                              )}
                              alt=""
                              loading={index < 12 ? "eager" : "lazy"}
                            />
                          )}
                          <AvatarFallback aria-hidden="true">
                            {getInitials(guild.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-medium">{guild.name}</span>
                        <span className="opacity-70">
                          {" · "}
                          {t("members", {
                            count: guild.member_count,
                          })}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <FallbackTile index={index} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function FallbackTile({ index }: { index: number }) {
  const TileIcon = FALLBACK_ICONS[index % FALLBACK_ICONS.length]
  return (
    <Avatar shape="squircle" className="size-(--tile)">
      <AvatarFallback>
        <TileIcon className="size-1/2" />
      </AvatarFallback>
    </Avatar>
  )
}

export { ServerCloud }
