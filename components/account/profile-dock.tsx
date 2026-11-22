"use client"

import {
  Bell,
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
  UserRound,
} from "lucide-react"

import { ThemeToggleButton } from "@/components/theme-toggle"
import { DockTile, MobileDock } from "@/components/site/mobile-dock"
import { useChatUnread } from "@/features/chat/hooks"
import { useLogout } from "@/features/auth/hooks"
import { useMine } from "@/features/lister/org-hooks"
import { useUnreadCount } from "@/features/notifications/hooks"

/**
 * The one tab bar for signed-in customers, on the search pages and the profile
 * alike, so the tabs never change underneath the reader. Marketing pages (home,
 * about, services...) don't show it; they use the header menu.
 */
export function CustomerDock() {
  const logout = useLogout()
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
        { label: "Deals", icon: Handshake, href: "/account/deals" },
        {
          label: "Profile",
          icon: UserRound,
          href: "/account",
          // Everything else under the profile (security, messages, alerts) lives here.
          match: (p) =>
            p === "/account" ||
            (p.startsWith("/account/") &&
              !p.startsWith("/account/viewings") &&
              !p.startsWith("/account/deals")),
        },
      ]}
      more={
        <div className="grid grid-cols-3 gap-2">
          <DockTile
            icon={MessageSquare}
            label={unreadChats ? `Messages (${unreadChats})` : "Messages"}
            href="/account/messages"
          />
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
          <DockTile
            icon={Building2}
            label={hasLister ? "Lister area" : "Be a lister"}
            href={hasLister ? "/account#listers" : "/account?lister=new"}
          />
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
      }
    />
  )
}

/** Kept for the profile layout's existing import. */
export const ProfileDock = CustomerDock
