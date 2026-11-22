"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Bell,
  ChevronRight,
  Handshake,
  LogOut,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react"

import { PatternBg } from "@/components/ui/pattern-bg"
import { InstallApp } from "@/components/account/install-app"
import { ListersSection } from "@/components/account/listers-section"
import { BecomeListerDialog } from "@/components/account/become-lister-dialog"
import { initialsOf } from "@/lib/initials"
import { Button } from "@/components/ui/button"
import { useChatUnread } from "@/features/chat/hooks"
import { useUnreadCount } from "@/features/notifications/hooks"
import { useLogout, useMe } from "@/features/auth/hooks"
import { useDeals, useInspections } from "@/features/deals/hooks"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

function Stat({
  href,
  icon: Icon,
  label,
  value,
  hint,
  featured,
}: {
  href: string
  icon: typeof Search
  label: string
  value: string
  hint: string
  featured?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        featured
          ? "group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl bg-panel p-4 text-panel-foreground shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:gap-3 sm:p-5"
          : "group flex flex-col gap-2.5 rounded-2xl bg-card p-4 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:gap-3 sm:p-5"
      }
    >
      {featured ? (
        <PatternBg className="object-right opacity-25 mix-blend-soft-light dark:opacity-20" />
      ) : null}
      <div className="relative flex items-center justify-between">
        <span
          className={
            featured
              ? "grid size-9 place-items-center rounded-full bg-panel-foreground/15"
              : "grid size-9 place-items-center rounded-full bg-primary/10 text-primary"
          }
        >
          <Icon className="size-[18px]" />
        </span>
        <ArrowUpRight className="size-4 opacity-60 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="relative">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {value}
        </p>
      </div>
      <p className="relative line-clamp-1 text-xs opacity-70">{hint}</p>
    </Link>
  )
}

export function OverviewPage() {
  const router = useRouter()
  const me = useMe().data
  const deals = useDeals().data
  const viewings = useInspections().data
  const logout = useLogout()
  const unreadChats = useChatUnread("customer", true).data ?? 0
  const unreadAlerts = useUnreadCount(true).data ?? 0
  const params = useSearchParams()
  const [creating, setCreating] = React.useState(params.get("lister") === "new")

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-2xl bg-card p-5 shadow-md sm:p-6">
        <PatternBg className="-z-10 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)] object-right opacity-25 dark:opacity-40" />
        <div
          aria-hidden
          className="absolute -top-20 -left-16 -z-10 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground shadow-md ring-4 ring-primary/15 sm:size-20 sm:text-2xl">
            {initialsOf(me?.firstName, me?.lastName)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {me?.firstName} {me?.lastName}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {me?.email}
            </p>
            {me?.emailVerifiedAt ? (
              <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <BadgeCheck className="size-3.5" /> Email verified
              </p>
            ) : null}
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/account/security">Password & security</Link>
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          featured
          href="/account/deals"
          icon={Handshake}
          label="Deals"
          value={deals ? String(deals.length) : "—"}
          hint="Reservations and payments"
        />
        <Stat
          href="/account/viewings"
          icon={CalendarCheck}
          label="Viewings"
          value={viewings ? String(viewings.length) : "—"}
          hint="Requested and confirmed visits"
        />
        <Stat
          href="/account/messages"
          icon={MessageSquare}
          label="Messages"
          value={unreadChats ? `${unreadChats} new` : "All read"}
          hint="Chat with listers"
        />
        <Stat
          href="/account/notifications"
          icon={Bell}
          label="Alerts"
          value={unreadAlerts ? `${unreadAlerts} new` : "All read"}
          hint="Payments, viewings, more"
        />
      </div>

      <nav
        aria-label="Quick links"
        className="overflow-hidden rounded-2xl bg-card shadow-md lg:hidden"
      >
        <ul className="divide-y">
          {[
            {
              href: "/account/security",
              icon: ShieldCheck,
              label: "Password & security",
              hint: "Devices and sign-in",
            },
            {
              href: "/properties",
              icon: Search,
              label: "Browse properties",
              hint: "Find your next home",
            },
            {
              href: "/contact",
              icon: Mail,
              label: "Contact Veridom",
              hint: "We usually reply fast",
            },
          ].map(({ href, icon: Icon, label, hint }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors outline-none focus-visible:bg-accent active:bg-accent"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {hint}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ListersSection onCreate={() => setCreating(true)} />

      <InstallApp />

      <Button
        variant="outline"
        size="lg"
        className="w-full bg-card lg:hidden"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <LogOut /> Log out
      </Button>
      <BecomeListerDialog
        open={creating}
        onOpenChange={(next) => {
          setCreating(next)
          if (!next && params.get("lister")) router.replace("/account")
        }}
      />
    </>
  )
}
