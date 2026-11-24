"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  HandCoins,
  Search,
  Timer,
} from "lucide-react"

import { FilterTabs } from "@/components/account/filter-tabs"
import { StatusBadge } from "@/components/account/status-badge"
import {
  ListerEmpty,
  ListerHero,
  ListSkeleton,
  timeAgo,
} from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { useDeals } from "@/features/deals/hooks"
import { formatDate, formatNaira } from "@/lib/format"

export function DealsPage() {
  const dealsQuery = useDeals()
  const deals = dealsQuery.data ?? []
  const waiting = deals.filter((d) => d.status === "HELD").length
  const paid = deals.filter((d) => ["PAID", "COMPLETED"].includes(d.status))
  const [filter, setFilter] = React.useState<
    "all" | "waiting" | "paid" | "closed"
  >("all")
  const closed = deals.filter((d) =>
    ["CANCELLED", "EXPIRED", "REFUNDED", "REFUND_DUE", "DISPUTED"].includes(
      d.status
    )
  )
  const buckets = {
    all: deals,
    waiting: deals.filter((d) => d.status === "HELD"),
    paid,
    closed,
  }
  const shown = buckets[filter]
  const paidKobo = paid.reduce((n, d) => n + (d.payKobo ?? d.totalKobo ?? 0), 0)

  return (
    <>
      <ListerHero
        icon={Handshake}
        eyebrow="My renting"
        title="Deals"
        description="Properties you've reserved, paid for or renewed."
        loading={dealsQuery.isPending}
        actions={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/properties">
              <Search /> Browse properties
            </Link>
          </Button>
        }
        stats={[
          { label: "All deals", value: deals.length, icon: Handshake },
          {
            label: "Awaiting payment",
            value: waiting,
            icon: Timer,
            tone: waiting ? "warn" : "default",
            hint: waiting ? "Pay before the hold ends" : "Nothing pending",
          },
          {
            label: "Paid",
            value: paid.length,
            icon: BadgeCheck,
            tone: "good",
          },
          {
            label: "Total paid",
            value: formatNaira(paidKobo),
            icon: HandCoins,
          },
        ]}
      />

      {dealsQuery.isPending ? (
        <ListSkeleton />
      ) : dealsQuery.error ? (
        <RetryState label="your deals" onRetry={() => dealsQuery.refetch()} />
      ) : deals.length === 0 ? (
        <ListerEmpty
          icon={Handshake}
          title="No deals yet"
          hint="When you reserve a property it appears here, with its payment and move-in status."
          action={
            <Button asChild>
              <Link href="/properties">Browse properties</Link>
            </Button>
          }
        />
      ) : (
        <>
          <FilterTabs
            label="Filter deals"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "all", label: "All", count: buckets.all.length },
              {
                value: "waiting",
                label: "Awaiting payment",
                count: buckets.waiting.length,
              },
              { value: "paid", label: "Paid", count: buckets.paid.length },
              {
                value: "closed",
                label: "Closed",
                count: buckets.closed.length,
              },
            ]}
          />
          {shown.length === 0 ? (
            <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-md">
              Nothing in this view.
            </p>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {shown.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/account/deals/${deal.id}`}
                    className="group flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:p-5"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Handshake className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold group-hover:text-primary">
                        {deal.listing?.title ?? "Property"}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {deal.moveInDate
                          ? `Move-in ${formatDate(deal.moveInDate)}`
                          : `Created ${timeAgo(deal.createdAt)}`}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                        <StatusBadge status={deal.status} />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                      <span className="font-semibold tabular-nums">
                        {formatNaira(deal.payKobo ?? deal.totalKobo)}
                      </span>
                      <span className="hidden sm:block">
                        <StatusBadge status={deal.status} />
                      </span>
                    </div>
                    <ArrowUpRight
                      className="hidden size-4 shrink-0 text-muted-foreground group-hover:text-primary sm:block"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}
