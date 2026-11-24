"use client"

import Link from "next/link"
import {
  Bell,
  ChevronRight,
  Briefcase,
  Building2,
  CalendarCheck,
  Handshake,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react"

import { ListerShortcutCards } from "@/components/account/lister-shortcut"
import { ThemeToggleButton } from "@/components/theme-toggle"
import { DockTile, MobileDock } from "@/components/site/mobile-dock"
import { useChatUnread } from "@/features/chat/hooks"
import { useLogout, useMe } from "@/features/auth/hooks"
import { initialsOf } from "@/lib/initials"
import { useMine } from "@/features/lister/org-hooks"
import { useUnreadCount } from "@/features/notifications/hooks"

/**
 * The one tab bar for signed-in customers, on the search pages and the profile
 * alike, so the tabs never change underneath the reader. Marketing pages (home,
 * about, services...) don't show it; they use the header menu.
 */
export function CustomerDock() {
  const logout = useLogout()
  const me = useMe().data
  const hasLister = Boolean(useMine().data?.organizations.length)
  const unreadChats = useChatUnread("customer", true).data ?? 0
  const unreadAlerts = useUnreadCount(true).data ?? 0

  return (
    <MobileDock
      items={[
        {
          label: "Explore",
          icon: Search,
          href: "/properties",
          match: (p) => p === "/properties" || p.startsWith("/properties/"),
        },
        { label: "Viewings", icon: CalendarCheck, href: "/account/viewings" },
        {
          label: "Chats",
          icon: MessageSquare,
          href: "/account/messages",
          badge: unreadChats,
        },
        { label: "Deals", icon: Handshake, href: "/account/deals" },
      ]}
      moreActive={(p) =>
        p === "/account" ||
        (p.startsWith("/account/") &&
          !p.startsWith("/account/viewings") &&
          !p.startsWith("/account/messages") &&
          !p.startsWith("/account/deals"))
      }
      more={
        <>
          <Link
            href="/account"
            className="mb-2 flex items-center gap-3 rounded-2xl bg-foreground/[0.04] p-3 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initialsOf(me?.firstName, me?.lastName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {me ? `${me.firstName} ${me.lastName}` : "Your profile"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                View profile and settings
              </span>
            </span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
          <ListerShortcutCards />
          <div className="grid grid-cols-3 gap-2">
            <DockTile
              icon={Bell}
              label={unreadAlerts ? `Alerts (${unreadAlerts})` : "Alerts"}
              href="/account/notifications"
            />
            <DockTile
              icon={ShieldCheck}
              label="Security"
              href="/account/security"
            />
            {hasLister ? null : (
              <DockTile
                icon={Building2}
                label="Be a lister"
                href="/account?lister=new"
              />
            )}
            <DockTile icon={Briefcase} label="Services" href="/services" />
            <DockTile icon={Info} label="About us" href="/about" />
            <DockTile icon={Mail} label="Contact" href="/contact" />
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-foreground/[0.04] px-2 py-3">
              <ThemeToggleButton className="size-10" />
              <span className="text-[12px] font-semibold">Theme</span>
            </div>
            <DockTile
              icon={LogOut}
              label="Log out"
              tone="danger"
              onClick={() => logout.mutate()}
            />
          </div>
        </>
      }
    />
  )
}

/** Kept for the profile layout's existing import. */
export const ProfileDock = CustomerDock
