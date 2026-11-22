"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Handshake,
  LogOut,
  Search,
} from "lucide-react"

import { PatternBg } from "@/components/ui/pattern-bg"
import { ListersSection } from "@/components/account/listers-section"
import { BecomeListerDialog } from "@/components/account/become-lister-dialog"
import { initialsOf } from "@/lib/initials"
import { Button } from "@/components/ui/button"
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
          ? "group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-panel p-5 text-panel-foreground shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl"
          : "group flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl"
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
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </div>
      <p className="relative text-xs opacity-70">{hint}</p>
    </Link>
  )
}

export function OverviewPage() {
  const router = useRouter()
  const me = useMe().data
  const deals = useDeals().data
  const viewings = useInspections().data
  const logout = useLogout()
  const params = useSearchParams()
  const [creating, setCreating] = React.useState(params.get("lister") === "new")

  return (
    <>
      <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-md sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground sm:size-20 sm:text-2xl">
          {initialsOf(me?.firstName, me?.lastName)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {me?.firstName} {me?.lastName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{me?.email}</p>
          {me?.emailVerifiedAt ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <BadgeCheck className="size-4" /> Email verified
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href="/account/security">Password & security</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <ListersSection onCreate={() => setCreating(true)} />

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
