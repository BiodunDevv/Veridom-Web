"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { useDeals } from "@/features/deals/hooks"
import { formatDate, formatNaira } from "@/lib/format"

export function DealsPage() {
  const dealsQuery = useDeals()
  const deals = dealsQuery.data ?? []

  return (
    <>
      <PageHeader
        title="Deals"
        description="Properties you've reserved, paid for or renewed."
      />
      {dealsQuery.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your deals…
        </p>
      ) : dealsQuery.error ? (
        <RetryState label="your deals" onRetry={() => dealsQuery.refetch()} />
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card px-6 py-14 text-center shadow-md">
          <p className="text-lg font-semibold">No deals yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When you reserve a property it appears here, with its payment and
            move-in status.
          </p>
          <Button asChild>
            <Link href="/properties">Browse properties</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4">
          {deals.map((deal) => (
            <li key={deal.id}>
              <Link
                href={`/account/deals/${deal.id}`}
                className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md transition-shadow hover:shadow-xl sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-semibold">
                    {deal.listing?.title ?? "Property"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {deal.moveInDate
                      ? `Move-in ${formatDate(deal.moveInDate)}`
                      : formatDate(deal.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatNaira(deal.payKobo ?? deal.totalKobo)}
                  </span>
                  <StatusBadge status={deal.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
