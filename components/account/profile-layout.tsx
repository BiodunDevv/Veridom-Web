"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  Bell,
  MessageSquare,
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
      {
        title: "Messages",
        href: "/account/messages",
        icon: MessageSquare,
        prefix: true,
      },
      {
        title: "Notifications",
        href: "/account/notifications",
        icon: Bell,
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

const TAB_PAGES = ["/account/viewings", "/account/messages", "/account/deals"]

/**
 * On phones, pages one level below the profile get a way back to it. Detail
 * pages (a deal, a viewing) already carry their own back link.
 */
function MobileBackBar({ pathname }: { pathname: string }) {
  const depth = pathname.split("/").filter(Boolean).length
  if (depth !== 2) return null
  // Viewings, chats and deals are tabs in the bottom bar: no "back" needed.
  if (TAB_PAGES.some((p) => pathname === p)) return null
  return (
    <Link
      href="/account"
      className="-mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-card py-1.5 pr-4 pl-2 text-sm font-semibold shadow-sm ring-1 ring-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:bg-accent lg:hidden"
    >
      <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
        <ArrowLeft className="size-3.5" aria-hidden />
      </span>
      Profile
    </Link>
  )
}

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
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background">
      <SiteHeader dock={false} />
      <main className="flex-1 bg-muted/60 px-4 py-6 pb-32 sm:px-8 lg:px-12 lg:py-12 lg:pb-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden flex-col gap-4 lg:sticky lg:top-28 lg:flex lg:self-start">
            <div className="hidden items-center gap-3 rounded-2xl bg-card p-4 shadow-md lg:flex">
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

          <section className="flex min-w-0 flex-col gap-5 lg:gap-6">
            <MobileBackBar pathname={pathname} />
            {children}
          </section>
        </div>
      </main>
      <ProfileDock />
    </div>
  )
}
