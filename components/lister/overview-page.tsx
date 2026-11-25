"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BadgeDollarSign,
  Building2,
  CircleCheck,
  Clock3,
  Handshake,
  Plus,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react"

import { PatternBg } from "@/components/ui/pattern-bg"
import { MetricLink, MetricRow } from "@/components/account/app-list"
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
      <section className="relative isolate overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <PatternBg className="-z-10 opacity-60 dark:opacity-70" />
        <div className="flex items-center gap-3.5 p-4 sm:p-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
            {initialsOfName(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {greeting()}
              {me ? `, ${me.firstName}` : ""}
            </p>
            <h1 className="truncate text-lg leading-tight font-semibold tracking-tight sm:text-xl">
              {name}
            </h1>
            {role ? (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5" aria-hidden /> {role.roleName}
              </p>
            ) : null}
          </div>
          {can("listing:create") ? (
            <Button asChild className="shrink-0">
              <Link href="/lister/listings/new">
                <Plus /> <span className="hidden sm:inline">New listing</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
          ) : null}
        </div>
        {canList || canViewings || canDeals ? (
          <MetricRow label="Lister summary">
            {canList ? (
              <MetricLink
                href="/lister/listings"
                label={
                  inReview ? `Live · ${inReview} in review` : "Live listings"
                }
                value={published}
                fresh={inReview > 0}
              />
            ) : null}
            {canViewings ? (
              <MetricLink
                href="/lister/viewings"
                label={requested ? `Viewings · ${requested} new` : "Viewings"}
                value={viewings.length}
                fresh={requested > 0}
              />
            ) : null}
            {canDeals ? (
              <MetricLink
                href="/lister/deals"
                label={awaiting ? `Deals · ${awaiting} waiting` : "Deals"}
                value={deals.length}
                fresh={awaiting > 0}
              />
            ) : null}
          </MetricRow>
        ) : null}
      </section>

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
            These come from your role. Ask an owner if you need more.{" "}
            <Link
              href="/lister/role"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              See your full role
            </Link>
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
