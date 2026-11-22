"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  ChevronRight,
  Handshake,
  Loader2,
  LogOut,
  Search,
} from "lucide-react"

import { initialsOf } from "@/lib/initials"
import { Button } from "@/components/ui/button"
import { useLogout, useMe } from "@/features/auth/hooks"
import { useDeals, useInspections } from "@/features/deals/hooks"
import { useMine, useSwitchOrg } from "@/features/lister/org-hooks"
import { useRouter } from "next/navigation"

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
          ? "group flex flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl"
          : "group flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl"
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={
            featured
              ? "grid size-9 place-items-center rounded-full bg-primary-foreground/15"
              : "grid size-9 place-items-center rounded-full bg-primary/10 text-primary"
          }
        >
          <Icon className="size-[18px]" />
        </span>
        <ArrowUpRight className="size-4 opacity-60 transition-opacity group-hover:opacity-100" />
      </div>
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </div>
      <p className="text-xs opacity-70">{hint}</p>
    </Link>
  )
}

export function OverviewPage() {
  const router = useRouter()
  const me = useMe().data
  const deals = useDeals().data
  const viewings = useInspections().data
  const mine = useMine().data
  const switchOrg = useSwitchOrg(() => router.push("/lister"))
  const logout = useLogout()
  const orgs = mine?.organizations ?? []

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

      <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {orgs.length ? "Your listers" : "Join as a lister"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {orgs.length
                ? "Switch to a lister to manage listings, viewings and payouts."
                : "Own or manage property? Create a lister to publish verified listings and receive payouts."}
            </p>
          </div>
        </div>
        {orgs.length ? (
          <ul className="flex flex-col gap-2">
            {orgs.map((org) => (
              <li key={org.organizationId}>
                <button
                  type="button"
                  disabled={switchOrg.isPending}
                  onClick={() => switchOrg.mutate(org.organizationId)}
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-left text-sm transition-colors hover:bg-accent disabled:opacity-60"
                >
                  <span className="flex-1 truncate font-medium">
                    {org.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {org.roleName}
                  </span>
                  {switchOrg.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <Button
          asChild
          variant={orgs.length ? "outline" : "default"}
          className="self-start"
        >
          <Link href="/lister">
            {orgs.length ? "Create another lister" : "Become a lister"}
          </Link>
        </Button>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full bg-card lg:hidden"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <LogOut /> Log out
      </Button>
    </>
  )
}
