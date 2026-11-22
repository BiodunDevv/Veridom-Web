"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeDollarSign,
  Building2,
  CalendarCheck,
  CircleCheck,
  Clock3,
  Handshake,
  Plus,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import { PatternBg } from "@/components/ui/pattern-bg"
import { StatusBadge } from "@/components/account/status-badge"
import { Button } from "@/components/ui/button"
import { useMe } from "@/features/auth/hooks"
import { useListerListings } from "@/features/lister/listing-hooks"
import { useMine, usePermissions } from "@/features/lister/org-hooks"
import {
  useListerDeals,
  useListerInspections,
} from "@/features/lister/ops-hooks"
import { formatNaira } from "@/lib/format"
import { PERMISSION_GROUPS, PERMISSION_LABELS } from "@/lib/permissions"
import { cn } from "@/lib/utils"

const greeting = () => {
  const hour = new Date().getHours()
  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening"
}

const initialsOfName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "L"

function Stat({
  href,
  icon: Icon,
  label,
  value,
  hint,
  featured,
}: {
  href: string
  icon: LucideIcon
  label: string
  value: string
  hint: string
  featured?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:p-5",
        featured ? "bg-panel text-panel-foreground" : "bg-card"
      )}
    >
      {featured ? (
        <PatternBg className="object-right opacity-25 mix-blend-soft-light" />
      ) : null}
      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full",
            featured ? "bg-panel-foreground/15" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        <ArrowUpRight className="size-4 opacity-60 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="relative">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
      <p className="relative text-xs opacity-70">{hint}</p>
    </Link>
  )
}

function Action({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string
  icon: LucideIcon
  title: string
  text: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {text}
        </span>
      </span>
      <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
  )
}

export function ListerOverviewPage() {
  const me = useMe().data
  const mine = useMine().data
  const { org, can } = usePermissions()
  const role = mine?.organizations.find(
    (o) => o.organizationId === mine.activeOrganizationId
  )

  const canList = can(
    "listing:create",
    "listing:update:any",
    "listing:update:assigned",
    "listing:close",
    "media:manage"
  )
  const canViewings = can("inspection:manage")
  const canDeals = can("deal:manage", "payout:manage")

  const listings = useListerListings("", 1).data ?? []
  const viewings = useListerInspections(canViewings).data ?? []
  const deals = useListerDeals(canDeals).data ?? []

  const published = listings.filter((l) => l.status === "PUBLISHED").length
  const inReview = listings.filter((l) => l.status === "PENDING_REVIEW").length
  const requested = viewings.filter((v) => v.status === "REQUESTED").length
  const awaiting = deals.filter((d) => d.status === "PAID").length

  const granted = PERMISSION_GROUPS.map((group) => ({
    label: group.label,
    keys: group.keys.filter((key) => can(key)),
  })).filter((group) => group.keys.length > 0)

  const name = org?.name ?? "Lister"

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-md sm:p-6">
        <PatternBg className="object-right opacity-25 dark:opacity-40" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-md">
              {initialsOfName(name)}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {greeting()}
                {me ? `, ${me.firstName}` : ""}
              </p>
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {name}
              </h1>
              {role ? (
                <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="size-3.5" /> {role.roleName}
                </span>
              ) : null}
            </div>
          </div>
          {can("listing:create") ? (
            <Button asChild size="lg">
              <Link href="/lister/listings/new">
                <Plus /> New listing
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {canList || canViewings || canDeals ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 [&>:last-child:nth-child(odd)]:col-span-2 xl:[&>:last-child:nth-child(odd)]:col-span-1">
          {canList ? (
            <Stat
              featured
              href="/lister/listings"
              icon={Building2}
              label="Live listings"
              value={String(published)}
              hint={
                inReview ? `${inReview} waiting for review` : "All reviewed"
              }
            />
          ) : null}
          {canViewings ? (
            <Stat
              href="/lister/viewings"
              icon={CalendarCheck}
              label="Viewings"
              value={String(viewings.length)}
              hint={
                requested
                  ? `${requested} new request${requested > 1 ? "s" : ""}`
                  : "No new requests"
              }
            />
          ) : null}
          {canDeals ? (
            <Stat
              href="/lister/deals"
              icon={Handshake}
              label="Deals"
              value={String(deals.length)}
              hint={
                awaiting ? `${awaiting} awaiting handover` : "Nothing waiting"
              }
            />
          ) : null}
        </div>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {can("listing:create") ? (
            <Action
              href="/lister/listings/new"
              icon={Plus}
              title="Add a listing"
              text="Start a new draft"
            />
          ) : null}
          {canViewings ? (
            <Action
              href="/lister/viewings"
              icon={Clock3}
              title="Review viewing requests"
              text={
                requested ? `${requested} waiting` : "Confirm or propose a time"
              }
            />
          ) : null}
          {canDeals ? (
            <Action
              href="/lister/deals"
              icon={Handshake}
              title="Open deals"
              text="Handover codes and payments"
            />
          ) : null}
          {can("member:invite", "member:manage") ? (
            <Action
              href="/lister/team"
              icon={UserPlus}
              title="Invite your team"
              text="Add managers and staff"
            />
          ) : null}
          {can("payout:manage") ? (
            <Action
              href="/lister/payouts"
              icon={BadgeDollarSign}
              title="Payout account"
              text="Where your money is sent"
            />
          ) : null}
        </div>
      </section>

      {canList ? (
        <section className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="size-5 text-primary" /> Latest listings
            </h2>
            <Link
              href="/lister/listings"
              className="text-sm font-semibold text-primary"
            >
              View all
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="rounded-xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
              No listings yet.
              {can("listing:create")
                ? " Create your first one to get started."
                : ""}
            </p>
          ) : (
            <ul className="divide-y">
              {listings.slice(0, 5).map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/lister/listings/${listing.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                  >
                    <span className="min-w-0 truncate font-medium">
                      {listing.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {formatNaira(listing.priceKobo)}
                      </span>
                      <StatusBadge status={listing.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CircleCheck className="size-5 text-primary" /> What you can do
          </h2>
          <p className="text-sm text-muted-foreground">
            These come from your role. Ask an owner if you need more.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {granted.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {group.keys.map((key) => (
                  <li
                    key={key}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {PERMISSION_LABELS[key]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
