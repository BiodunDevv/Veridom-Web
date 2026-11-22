"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  HandCoins,
  KeyRound,
  Timer,
} from "lucide-react"

import {
  ListerEmpty,
  ListerHero,
  ListSkeleton,
  timeAgo,
} from "@/components/lister/lister-ui"
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
  const paid = items.filter((d) => d.status === "PAID")
  const held = items.filter((d) => d.status === "HELD")
  const paidKobo = paid.reduce((n, d) => n + (d.totalKobo ?? d.payKobo ?? 0), 0)

  return (
    <>
      <ListerHero
        icon={Handshake}
        eyebrow="Deals"
        title="Deals"
        description="Reservations and payments for your listings."
        loading={query.isPending}
        stats={[
          { label: "All deals", value: items.length, icon: Handshake },
          {
            label: "Paid",
            value: paid.length,
            icon: BadgeCheck,
            tone: "good",
            hint: "Ready for handover",
          },
          {
            label: "On hold",
            value: held.length,
            icon: Timer,
            tone: held.length ? "warn" : "default",
            hint: "Waiting for payment",
          },
          {
            label: "Paid value",
            value: formatNaira(paidKobo),
            icon: HandCoins,
          },
        ]}
      />
      {query.isPending ? (
        <ListSkeleton />
      ) : query.isError ? (
        <RetryState label="deals" onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <ListerEmpty
          icon={Handshake}
          title="No deals yet"
          hint="When a customer reserves one of your listings, the deal shows up here with its payment status."
        />
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
          {items.map((deal) => (
            <li
              key={deal.id}
              className="group flex flex-col gap-3 rounded-xl bg-card p-4 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:grid">
                  <Handshake className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/lister/deals/${deal.id}`}
                    className="flex items-center gap-1 truncate font-semibold group-hover:text-primary"
                  >
                    <span className="truncate">
                      {deal.listing?.title ?? "Property"}
                    </span>
                    <ArrowUpRight
                      className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {deal.moveInDate
                      ? `Move-in ${formatDate(deal.moveInDate)}`
                      : `Created ${timeAgo(deal.createdAt)}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold tabular-nums">
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
