"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  CalendarCheck,
  Handshake,
  LogOut,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { ProfileDock } from "@/components/account/profile-dock"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { useLogout, useMe } from "@/features/auth/hooks"
import { useMine } from "@/features/lister/org-hooks"
import { initialsOf } from "@/lib/initials"
import { cn } from "@/lib/utils"

type Item = {
  title: string
  href: string
  icon: LucideIcon
  prefix?: boolean
}

const groups: { label: string; items: Item[] }[] = [
  {
    label: "General",
    items: [
      { title: "Profile", href: "/account", icon: UserRound },
      {
        title: "My deals",
        href: "/account/deals",
        icon: Handshake,
        prefix: true,
      },
      {
        title: "My viewings",
        href: "/account/viewings",
        icon: CalendarCheck,
        prefix: true,
      },
    ],
  },
  {
    label: "Listing",
    items: [{ title: "Lister area", href: "/lister", icon: Building2 }],
  },
  {
    label: "Security",
    items: [
      {
        title: "Password & security",
        href: "/account/security",
        icon: ShieldCheck,
        prefix: true,
      },
    ],
  },
  {
    label: "Explore",
    items: [
      { title: "Browse properties", href: "/properties", icon: Search },
      { title: "Contact us", href: "/contact", icon: Mail },
    ],
  },
]

const isActive = (item: Item, pathname: string) =>
  item.prefix
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href

/** Profile area inside the public site shell. */
export function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const me = useMe().data
  const logout = useLogout()
  const mine = useMine().data
  const hasLister = Boolean(mine?.organizations.length)
  const visibleGroups = groups.filter(
    (group) => group.label !== "Listing" || hasLister
  )

  return (
    <div className="relative overflow-x-clip bg-background">
      <SiteHeader dock={false} />
      <main className="bg-muted/60 px-4 py-6 pb-32 sm:px-8 lg:px-12 lg:py-12 lg:pb-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-md">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {initialsOf(me?.firstName, me?.lastName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {me?.firstName} {me?.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {me?.email}
                </p>
              </div>
            </div>

            <nav
              aria-label="Profile sections"
              className="hidden flex-col gap-5 rounded-2xl bg-card p-3 shadow-md lg:flex"
            >
              {visibleGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-1">
                  <p className="px-3 pt-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const active = isActive(item, pathname)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <item.icon className="size-[18px]" />
                        {item.title}
                      </Link>
                    )
                  })}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
              >
                <LogOut /> Log out
              </Button>
            </nav>
          </aside>

          <section className="flex min-w-0 flex-col gap-6">{children}</section>
        </div>
      </main>
      <SiteFooter />
      <ProfileDock />
    </div>
  )
}
