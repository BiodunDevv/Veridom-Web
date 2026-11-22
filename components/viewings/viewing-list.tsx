"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import type { Inspection } from "@/lib/api/deals"
import { formatDate } from "@/lib/format"

type Query = {
  isPending: boolean
  isError: boolean
  data?: Inspection[]
  refetch: () => unknown
}

/** The viewings list for either side; each row opens the full viewing with its actions. */
export function ViewingList({
  query,
  title,
  description,
  basePath,
  emptyTitle,
  emptyHint,
  cta,
}: {
  query: Query
  title: string
  description: string
  basePath: string
  emptyTitle: string
  emptyHint: string
  cta?: { href: string; label: string }
}) {
  const items = query.data ?? []

  return (
    <>
      <PageHeader title={title} description={description} />
      {query.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : query.isError ? (
        <RetryState label="viewings" onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card px-6 py-14 text-center shadow-md">
          <p className="text-lg font-semibold">{emptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
          {cta ? (
            <Button asChild>
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4">
          {items.map((viewing) => (
            <li key={viewing.id}>
              <Link
                href={`${basePath}/${viewing.id}`}
                className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md transition-shadow hover:shadow-xl sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-semibold">
                    {viewing.listing?.title ?? "Property viewing"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(viewing.startsAt)}
                  </p>
                  {viewing.listing?.addressLine ? (
                    <p className="text-sm">{viewing.listing.addressLine}</p>
                  ) : null}
                </div>
                <StatusBadge status={viewing.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
