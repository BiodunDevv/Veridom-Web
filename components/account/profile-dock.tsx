"use client"

import {
  Building2,
  CalendarCheck,
  Handshake,
  LogOut,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { ThemeToggleButton } from "@/components/theme-toggle"
import { DockTile, MobileDock } from "@/components/site/mobile-dock"
import { useLogout } from "@/features/auth/hooks"
import { useMine } from "@/features/lister/org-hooks"

/** Phone tab bar for the profile area. */
export function ProfileDock() {
  const logout = useLogout()
  const hasLister = Boolean(useMine().data?.organizations.length)

  return (
    <MobileDock
      items={[
        { label: "Explore", icon: Search, href: "/properties" },
        { label: "Viewings", icon: CalendarCheck, href: "/account/viewings" },
        { label: "Deals", icon: Handshake, href: "/account/deals" },
        {
          label: "Profile",
          icon: UserRound,
          href: "/account",
          match: (p) => p === "/account" || p.startsWith("/account/security"),
        },
      ]}
      more={
        <div className="grid grid-cols-3 gap-2">
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
