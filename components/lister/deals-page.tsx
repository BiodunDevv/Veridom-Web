"use client"

import * as React from "react"
import Link from "next/link"
import { KeyRound, Loader2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHandoverCode, useListerDeals } from "@/features/lister/ops-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import { formatDate, formatNaira } from "@/lib/format"

export function ListerDealsPage() {
  const { can } = usePermissions()
  const query = useListerDeals()
  const [code, setCode] = React.useState<{
    code: string
    expiresAt: string
  } | null>(null)
  const handover = useHandoverCode(setCode)
  const items = query.data ?? []

  return (
    <>
      <PageHeader
        title="Deals"
        description="Reservations and payments for your listings."
      />
      {query.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : query.isError ? (
        <RetryState label="deals" onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-md">
          No deals yet.
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((deal) => (
            <li
              key={deal.id}
              className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/lister/deals/${deal.id}`}
                  className="block truncate font-semibold hover:text-primary"
                >
                  {deal.listing?.title ?? "Property"}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {deal.moveInDate
                    ? `Move-in ${formatDate(deal.moveInDate)}`
                    : formatDate(deal.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">
                  {formatNaira(deal.totalKobo ?? deal.payKobo)}
                </span>
                <StatusBadge status={deal.status} />
                {deal.status === "PAID" && can("deal:manage") ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={handover.isPending}
                    onClick={() => handover.mutate(deal.id)}
                  >
                    <KeyRound /> Handover code
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(code)}
        onOpenChange={(open) => !open && setCode(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Handover code</DialogTitle>
            <DialogDescription>
              Give this to the customer in person, at the property. It&apos;s
              shown once and is valid for 24 hours. Never send it in chat or
              messages.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-secondary py-6 text-center font-mono text-4xl font-semibold tracking-[0.3em]">
            {code?.code}
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Expires {formatDate(code?.expiresAt)}
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
