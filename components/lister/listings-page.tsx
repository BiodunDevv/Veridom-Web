"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { useListerListings } from "@/features/lister/listing-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import type { ListingStatus } from "@/lib/api/lister"
import { formatDate, formatNaira } from "@/lib/format"
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

export function ListerListingsPage() {
  const { can } = usePermissions()
  const [status, setStatus] = React.useState<ListingStatus | "">("")
  const [page, setPage] = React.useState(1)
  const query = useListerListings(status, page)
  const items = query.data ?? []

  return (
    <>
      <PageHeader
        title="My listings"
        description="Create, review and manage what you've listed."
        actions={
          can("listing:create") ? (
            <Button asChild>
              <Link href="/lister/listings/new">
                <Plus /> New listing
              </Link>
            </Button>
          ) : null
        }
      />

      <div role="tablist" aria-label="Status" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => {
              setStatus(tab.value)
              setPage(1)
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-input hover:bg-accent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : query.isError ? (
        <RetryState label="your listings" onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card px-6 py-14 text-center shadow-md">
          <p className="text-lg font-semibold">Nothing here yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Listings you create appear here with their status.
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-3">
            {items.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/lister/listings/${listing.id}`}
                  className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md transition-shadow hover:shadow-xl sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated {formatDate(listing.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatNaira(listing.priceKobo)}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>
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
