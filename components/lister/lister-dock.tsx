"use client"

import * as React from "react"

import { type I8Name } from "@/components/ui/i8-icon"
import { ListerSwitcherDrawer } from "@/components/lister/lister-switcher"
import { navFor } from "@/components/lister/lister-nav"
import {
  DockTile,
  type DockArt,
  type DockWash,
  ThemeTile,
  MobileDock,
  type DockItem,
} from "@/components/site/mobile-dock"
import { useRouter } from "next/navigation"
import { useChatUnread } from "@/features/chat/hooks"
import { usePermissions, useSwitchOrg } from "@/features/lister/org-hooks"

/** Phone tab bar for the lister area, built from what the role may use. */
/** Full-colour tiles for the pages that live under "More". */
const LISTER_ART: Record<string, { art: DockArt; wash: DockWash }> = {
  "/lister": { art: "real-estate", wash: "rose" },
  "/lister/listings": { art: "real-estate", wash: "rose" },
  "/lister/role": { art: "security-shield-green", wash: "emerald" },
  "/lister/team": { art: "conference-call", wash: "blue" },
  "/lister/payouts": { art: "money-bag", wash: "green" },
  "/lister/audit": { art: "time-machine", wash: "amber" },
  "/lister/settings": { art: "settings", wash: "slate" },
}

/** Icons8 icons for the lister tabs, by route. */
const LISTER_I8: Record<string, I8Name> = {
  "/lister": "grid-2",
  "/lister/listings": "building",
  "/lister/viewings": "calendar",
  "/lister/inquiries": "speech-bubble",
  "/lister/deals": "handshake",
  "/lister/role": "shield",
  "/lister/team": "conference-call",
  "/lister/payouts": "money-bag",
  "/lister/audit": "activity-history",
  "/lister/settings": "settings",
}

export function ListerDock() {
  const { can } = usePermissions()
  const router = useRouter()
  const leave = useSwitchOrg(() => router.push("/account"))
  const [switching, setSwitching] = React.useState(false)
  const all = navFor(can).flatMap((group) => group.items)
  const primaryPaths = [
    "/lister",
    "/lister/listings",
    "/lister/viewings",
    "/lister/inquiries",
  ]
  const canChat = can(
    "inquiry:read:any",
    "inquiry:read:assigned",
    "inquiry:respond"
  )
  const unreadChats = useChatUnread("lister", canChat).data ?? 0
  const primary = primaryPaths
    .map((path) => all.find((item) => item.path === path))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  const rest = all.filter((item) => !primaryPaths.includes(item.path))

  const items: DockItem[] = primary.map((item) => ({
    label: item.title
      .replace("My listings", "Listings")
      .replace("Messages", "Chats"),
    badge: item.path === "/lister/inquiries" ? unreadChats : undefined,
    href: item.path,
    i8: LISTER_I8[item.path],
    iconNode: item.icon,
    match: (p) =>
      item.prefix
        ? p === item.path || p.startsWith(`${item.path}/`)
        : p === item.path,
  }))

  return (
    <>
      <MobileDock
        items={items}
        moreActive={(p) => !items.some((item) => item.match?.(p))}
        more={
          <div className="grid grid-cols-3 gap-2">
            {rest.map((item) => (
              <DockTile
                key={item.path}
                {...(LISTER_ART[item.path] ?? LISTER_ART["/lister"])}
                label={item.title}
                href={item.path}
              />
            ))}
            <DockTile
              art="synchronize"
              wash="amber"
              label="Switch lister"
              onClick={() => setSwitching(true)}
            />
            <DockTile
              art="logout-rounded-left"
              wash="sky"
              label="Leave lister area"
              onClick={() => leave.mutate(null)}
            />
            <ThemeTile />
          </div>
        }
      />
      <ListerSwitcherDrawer open={switching} onOpenChange={setSwitching} />
    </>
  )
}
