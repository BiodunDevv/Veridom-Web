"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { useListerDeal } from "@/features/lister/ops-hooks"
import { formatDate, formatNaira } from "@/lib/format"
import { DetailSkeleton } from "@/components/ui/page-skeletons"

export function ListerDealDetailPage({ id }: { id: string }) {
  const query = useListerDeal(id)
  const deal = query.data

  if (query.isPending) return <DetailSkeleton />
  if (!deal)
    return <RetryState label="this deal" onRetry={() => query.refetch()} />

  return (
    <>
      <Link
        href="/lister/deals"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All deals
      </Link>
      <PageHeader
        title={deal.listing?.title ?? "Deal"}
        description={
          deal.moveInDate ? `Move-in ${formatDate(deal.moveInDate)}` : undefined
        }
        actions={<StatusBadge status={deal.status} />}
      />
      <section className="flex max-w-xl flex-col gap-3 rounded-xl bg-card p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold">Money</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-medium">{formatNaira(deal.totalKobo)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Payout transfer</dt>
            <dd>
              {deal.transfer ? (
                <StatusBadge status={deal.transfer.status} />
              ) : (
                "Not started"
              )}
            </dd>
          </div>
          {deal.listerAmountKobo ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">You receive</dt>
              <dd className="font-semibold">
                {formatNaira(deal.listerAmountKobo)}
              </dd>
            </div>
          ) : null}
          {deal.commissionListerKobo ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Veridom fee (your half)</dt>
              <dd className="font-medium">
                {formatNaira(deal.commissionListerKobo)}
              </dd>
            </div>
          ) : null}
          {deal.transfer?.releaseAfter ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payout released after</dt>
              <dd className="font-medium">
                {formatDate(deal.transfer.releaseAfter)}
              </dd>
            </div>
          ) : null}
          {deal.transfer?.blockReason ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Why it&apos;s blocked</dt>
              <dd className="text-right font-medium text-destructive">
                {deal.transfer.blockReason}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="text-xs text-muted-foreground">
          Large payouts are sent as several transfers; this shows the latest
          one.
        </p>
      </section>
    </>
  )
}
