"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  CircleCheck,
  Clock3,
  FileEdit,
  Plus,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import {
  ListerEmpty,
  ListerHero,
  ListSkeleton,
  timeAgo,
} from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { useListerListings } from "@/features/lister/listing-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import type { ListingStatus } from "@/lib/api/lister"
import { formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

const tabs: { value: ListingStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "PENDING_REVIEW", label: "In review" },
  { value: "PUBLISHED", label: "Live" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
]

/** The colour rail and icon tint that say what state a listing is in. */
const rail: Record<string, string> = {
  PUBLISHED: "bg-primary",
  PENDING_REVIEW: "bg-amber-500",
  REJECTED: "bg-destructive",
  DRAFT: "bg-muted-foreground/40",
  PAUSED: "bg-sky-500",
  CLOSED: "bg-muted-foreground/25",
}

export function ListerListingsPage() {
  const { can } = usePermissions()
  const [status, setStatus] = React.useState<ListingStatus | "">("")
  const [page, setPage] = React.useState(1)
  const query = useListerListings(status, page)
  const all = useListerListings("", 1)
  const items = query.data ?? []
  const overview = all.data ?? []
  const count = (s: ListingStatus) =>
    overview.filter((l) => l.status === s).length
  const needsAttention = overview.filter((l) => l.status === "REJECTED").length

  return (
    <>
      <ListerHero
        icon={Building2}
        eyebrow="Listings"
        title="My listings"
        description="Create, review and manage what you've listed."
        loading={all.isPending}
        actions={
          can("listing:create") ? (
            <Button asChild>
              <Link href="/lister/listings/new">
                <Plus /> New listing
              </Link>
            </Button>
          ) : null
        }
        stats={[
          {
            label: "Live",
            value: count("PUBLISHED"),
            icon: CircleCheck,
            tone: "good",
            hint: "Visible to renters",
          },
          {
            label: "In review",
            value: count("PENDING_REVIEW"),
            icon: Clock3,
            tone: "warn",
            hint: "Waiting for Veridom",
          },
          {
            label: "Drafts",
            value: count("DRAFT"),
            icon: FileEdit,
            hint: "Not submitted yet",
          },
          {
            label: "Need changes",
            value: needsAttention,
            icon: Building2,
            tone: needsAttention ? "warn" : "default",
            hint: needsAttention ? "Rejected, fix and resubmit" : "All clear",
          },
        ]}
      />

      <div
        role="tablist"
        aria-label="Status"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const n =
            tab.value === ""
              ? overview.length
              : count(tab.value as ListingStatus)
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => {
                setStatus(tab.value)
                setPage(1)
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                status === tab.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-accent"
              )}
            >
              {tab.label}
              {overview.length && n ? (
                <span className="rounded-full bg-foreground/10 px-1.5 text-[11px] tabular-nums">
                  {n}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {query.isPending ? (
        <ListSkeleton />
      ) : query.isError ? (
        <RetryState label="your listings" onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <ListerEmpty
          icon={Building2}
          title={status ? "Nothing in this view" : "Nothing here yet"}
          hint={
            status
              ? "Try another status, or create a new listing."
              : "Listings you create appear here with their status."
          }
          action={
            can("listing:create") ? (
              <Button asChild>
                <Link href="/lister/listings/new">
                  <Plus /> Create your first listing
                </Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <ul className="grid gap-3">
            {items.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/lister/listings/${listing.id}`}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-xl bg-card p-4 pl-5 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:p-5 sm:pl-6"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      rail[listing.status] ?? "bg-muted"
                    )}
                  />
                  <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary sm:grid">
                    <Building2 className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold group-hover:text-primary">
                      {listing.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Updated {timeAgo(listing.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                    <span className="font-semibold tabular-nums">
                      {formatNaira(listing.priceKobo)}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>
                  <ArrowUpRight
                    className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary sm:block"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              disabled={items.length < 20}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </>
  )
}
