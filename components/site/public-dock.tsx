"use client"

import { Briefcase, Home, Info, Mail, Search, UserRound } from "lucide-react"

import { ThemeToggleButton } from "@/components/theme-toggle"
import { useMe } from "@/features/auth/hooks"

import { DockTile, MobileDock } from "./mobile-dock"

/** Phone tab bar for the public site. Visitors use the header menu instead. */
export function PublicDock() {
  const me = useMe().data
  if (!me) return null

  return (
    <MobileDock
      items={[
        { label: "Home", icon: Home, href: "/" },
        { label: "Properties", icon: Search, href: "/properties" },
        { label: "Services", icon: Briefcase, href: "/services" },
        { label: "Profile", icon: UserRound, href: "/account" },
      ]}
      more={
        <div className="grid grid-cols-3 gap-2">
          <DockTile icon={Info} label="About us" href="/about" />
          <DockTile icon={Mail} label="Contact" href="/contact" />
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-foreground/[0.04] px-2 py-3">
            <ThemeToggleButton className="size-10" />
            <span className="text-[12px] font-semibold">Theme</span>
          </div>
        </div>
      }
    />
  )
}
