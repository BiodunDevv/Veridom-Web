"use client"

import Link from "next/link"
import { ArrowLeftRight, UserRound } from "lucide-react"

import { navFor } from "@/components/lister/lister-nav"
import { ThemeToggleButton } from "@/components/theme-toggle"
import {
  DockTile,
  MobileDock,
  type DockItem,
} from "@/components/site/mobile-dock"
import { usePermissions } from "@/features/lister/org-hooks"

/** Phone tab bar for the lister area, built from what the role may use. */
export function ListerDock() {
  const { can } = usePermissions()
  const all = navFor(can).flatMap((group) => group.items)
  const primaryPaths = [
    "/lister",
    "/lister/listings",
    "/lister/viewings",
    "/lister/deals",
  ]
  const primary = primaryPaths
    .map((path) => all.find((item) => item.path === path))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  const rest = all.filter((item) => !primaryPaths.includes(item.path))

  const items: DockItem[] = primary.map((item) => ({
    label: item.title.replace("My listings", "Listings"),
    href: item.path,
    iconNode: item.icon,
    match: (p) =>
      item.prefix
        ? p === item.path || p.startsWith(`${item.path}/`)
        : p === item.path,
  }))

  return (
    <MobileDock
      items={items}
      more={
        <div className="grid grid-cols-3 gap-2">
          {rest.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-foreground/[0.04] px-2 py-3 text-center transition-transform outline-none active:scale-95"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">
                {item.icon}
              </span>
              <span className="text-[12px] leading-tight font-semibold">
                {item.title}
              </span>
            </Link>
          ))}
          <DockTile
            icon={ArrowLeftRight}
            label="Switch lister"
            href="/account#listers"
          />
          <DockTile icon={UserRound} label="My profile" href="/account" />
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-foreground/[0.04] px-2 py-3">
            <ThemeToggleButton className="size-10" />
            <span className="text-[12px] font-semibold">Theme</span>
          </div>
        </div>
      }
    />
  )
}
