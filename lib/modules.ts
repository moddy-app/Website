import {
  AlarmIcon,
  BadgeIcon,
  BuildIcon,
  ConfirmationNumberIcon,
  GavelIcon,
  HistoryIcon,
  HowToRegIcon,
  HubIcon,
  MailIcon,
  MicIcon,
  NotificationsIcon,
  PaletteIcon,
  ReceiptLongIcon,
  ShieldPersonIcon,
  SpeedIcon,
  StarIcon,
  StarShineIcon,
  WavingHandIcon,
  type Icon,
} from "@/components/icons"

/**
 * Every Moddy module shown on /modules, in display order.
 * Names and descriptions live in the `modules.items.<id>` messages,
 * group titles in `modules.groups.<group>`.
 */

export const moduleGroups = [
  "moderation",
  "welcome",
  "community",
  "customization",
] as const

export type ModuleGroup = (typeof moduleGroups)[number]

/**
 * - `premium`: part of the module needs Moddy Max.
 * - `paused`: the module is temporarily switched off (see its docs page).
 */
export type ModuleTag = "premium" | "paused"

type ModuleDefinition = {
  id: string
  group: ModuleGroup
  /** Docs page, localized with `docsUrl(docsPath, locale)`. */
  docsPath: `/${string}`
  icon: Icon
  tag?: ModuleTag
}

const definitions = [
  // Moderation
  {
    id: "automod",
    group: "moderation",
    docsPath: "/moderation/automod",
    icon: StarShineIcon,
  },
  {
    id: "cases",
    group: "moderation",
    docsPath: "/moderation/cases",
    icon: GavelIcon,
  },
  {
    id: "altguard",
    group: "moderation",
    docsPath: "/modules/altguard",
    icon: ShieldPersonIcon,
  },
  {
    id: "logs",
    group: "moderation",
    docsPath: "/modules/logs",
    icon: ReceiptLongIcon,
  },
  {
    id: "adaptiveSlowmode",
    group: "moderation",
    docsPath: "/modules/adaptive-slowmode",
    icon: SpeedIcon,
  },
  // Welcome & roles
  {
    id: "welcome",
    group: "welcome",
    docsPath: "/modules/welcome",
    icon: WavingHandIcon,
  },
  {
    id: "welcomeDm",
    group: "welcome",
    docsPath: "/modules/welcome-dm",
    icon: MailIcon,
  },
  {
    id: "autoRole",
    group: "welcome",
    docsPath: "/modules/auto-role",
    icon: BadgeIcon,
  },
  {
    id: "autoRestoreRoles",
    group: "welcome",
    docsPath: "/modules/auto-restore-roles",
    icon: HistoryIcon,
  },
  {
    id: "memberApplications",
    group: "welcome",
    docsPath: "/modules/member-applications",
    icon: HowToRegIcon,
  },
  // Community
  {
    id: "tickets",
    group: "community",
    docsPath: "/modules/tickets",
    icon: ConfirmationNumberIcon,
  },
  {
    id: "socialNotifications",
    group: "community",
    docsPath: "/modules/social-notifications",
    icon: NotificationsIcon,
  },
  {
    id: "starboard",
    group: "community",
    docsPath: "/modules/starboard",
    icon: StarIcon,
  },
  {
    id: "voiceTranscription",
    group: "community",
    docsPath: "/modules/voice-transcription",
    icon: MicIcon,
  },
  {
    id: "bumpReminder",
    group: "community",
    docsPath: "/modules/bump-reminder",
    icon: AlarmIcon,
  },
  {
    id: "interserver",
    group: "community",
    docsPath: "/modules/interserver",
    icon: HubIcon,
    tag: "paused",
  },
  // Customization & tools
  {
    id: "botCustomization",
    group: "customization",
    docsPath: "/modules/bot-customization",
    icon: PaletteIcon,
    tag: "premium",
  },
  {
    id: "utilities",
    group: "customization",
    docsPath: "/utilities/overview",
    icon: BuildIcon,
  },
] as const satisfies readonly ModuleDefinition[]

export type ModuleId = (typeof definitions)[number]["id"]

export type Module = ModuleDefinition & { id: ModuleId }

export const modules: readonly Module[] = definitions

/** Number of modules listed on /modules. */
export const moduleCount = definitions.length

export function getModulesByGroup(group: ModuleGroup) {
  return modules.filter((item) => item.group === group)
}
