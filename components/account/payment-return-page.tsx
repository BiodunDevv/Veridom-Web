"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { Illustration } from "@/components/ui/illustration"
import { PatternBg } from "@/components/ui/pattern-bg"
import { DetailSkeleton } from "@/components/ui/page-skeletons"
import { dealsApi, type Deal } from "@/lib/api/deals"
import { formatCalendarDate, formatNaira } from "@/lib/format"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"

/** Paystack confirms in seconds. After this long, say it may still arrive. */
const GIVE_UP_AFTER = 60

type View = "success" | "waiting" | "slow" | "expired" | "other"

const viewFor = (deal: Deal, waited: number): View => {
  if (deal.status === "PAID" || deal.status === "COMPLETED") return "success"
  if (deal.status === "HELD")
    return waited >= GIVE_UP_AFTER ? "slow" : "waiting"
  if (deal.status === "EXPIRED") return "expired"
  return "other"
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium break-all tabular-nums">
        {children}
      </dd>
    </div>
  )
}

/** Where Paystack sends people after paying: confirm it, then hand over to the deal. */
export function PaymentReturnPage({ id }: { id: string }) {
  const params = useSearchParams()
  const reference = params.get("reference") ?? params.get("trxref")
  const [waited, setWaited] = React.useState(0)

  // Never trust the redirect: only the server's status counts. Ask every 2
  // seconds while the deal is still held, for up to a minute.
  const query = useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => dealsApi.get(id),
    refetchInterval: (q) =>
      q.state.data?.status === "HELD" && waited < GIVE_UP_AFTER ? 2000 : false,
  })
  const deal = query.data
  const paid = deal?.status === "PAID" || deal?.status === "COMPLETED"

  React.useEffect(() => {
    if (paid) return
    const timer = window.setInterval(() => setWaited((s) => s + 1), 1000)
    return () => window.clearInterval(timer)
  }, [paid])

  if (query.isPending) return <DetailSkeleton />
  if (!deal)
    return <RetryState label="your payment" onRetry={() => query.refetch()} />

  const view = viewFor(deal, waited)
  const title = deal.listing?.title ?? "Your deal"
  const amount = formatNaira(deal.payKobo ?? deal.totalKobo)

  const copy = async () => {
    if (!reference) return
    try {
      await navigator.clipboard.writeText(reference)
      toast.success("Reference copied.")
    } catch {
      toast.error("Could not copy the reference.")
    }
  }

  const content: Record<
    View,
    {
      icon: React.ReactNode
      heading: string
      body: string
      tone: "good" | "wait" | "warn"
    }
  > = {
    success: {
      icon: <CheckCircle2 className="size-8" />,
      heading: "Payment received",
      body: `Your ${amount} is held safely by Veridom until you confirm move-in. You'll get the handover code from the lister on move-in day.`,
      tone: "good",
    },
    waiting: {
      icon: <Loader2 className="size-8 animate-spin" />,
      heading: "Confirming your payment",
      body: "This usually takes a few seconds. Please keep this page open.",
      tone: "wait",
    },
    slow: {
      icon: <Clock3 className="size-8" />,
      heading: "Still waiting for confirmation",
      body: "Your bank is taking longer than usual. If you were charged, the payment will still arrive and your deal will update by itself.",
      tone: "warn",
    },
    expired: {
      icon: <CircleAlert className="size-8" />,
      heading: "The hold ended",
      body: "If you paid just now, don't worry: a late payment is honoured when the property is still free, otherwise it's refunded.",
      tone: "warn",
    },
    other: {
      icon: <CircleAlert className="size-8" />,
      heading: "This deal has changed",
      body: "Open the deal to see what happened and what you can do next.",
      tone: "warn",
    },
  }
  const { icon, heading, body, tone } = content[view]

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 py-2 sm:py-6">
      <section
        aria-live="polite"
        className="relative isolate overflow-hidden rounded-3xl bg-card p-6 text-center shadow-sm ring-1 ring-border sm:p-8"
      >
        <PatternBg className="-z-10 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

        {view === "success" ? (
          <Illustration
            name="paymentHeld"
            size="lg"
            priority
            className="mx-auto mb-4 animate-in duration-500 zoom-in-95 fade-in"
          />
        ) : (
          <div className="mx-auto mb-5 grid size-16 place-items-center">
            <span
              className={cn(
                "relative grid size-16 place-items-center rounded-full transition-colors duration-500",
                tone === "good" &&
                  "bg-primary text-primary-foreground shadow-md",
                tone === "wait" && "bg-primary/10 text-primary",
                tone === "warn" &&
                  "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              <span
                key={view}
                className="animate-in duration-500 zoom-in-50 fade-in"
              >
                {icon}
              </span>
              {tone === "good" ? (
                <span className="absolute inset-0 rounded-full bg-primary/30 [animation-duration:2.4s] [animation-iteration-count:2] motion-safe:animate-ping" />
              ) : null}
            </span>
          </div>
        )}

        <h1
          key={heading}
          className="animate-in text-xl font-semibold tracking-tight fade-in slide-in-from-bottom-1 sm:text-2xl"
        >
          {heading}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-balance text-muted-foreground">
          {body}
        </p>

        {view === "waiting" ? (
          <div
            role="progressbar"
            aria-label="Confirming your payment"
            className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-muted"
          >
            <span className="block h-full w-1/3 animate-[indeterminate_1.3s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        ) : null}

        <dl className="mt-6 flex flex-col gap-2.5 border-t pt-5 text-left">
          <Row label="Property">{title}</Row>
          <Row label={paid ? "Amount paid" : "Amount"}>{amount}</Row>
          {deal.moveInDate ? (
            <Row label="Move-in">{formatCalendarDate(deal.moveInDate)}</Row>
          ) : null}
          {reference ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="flex min-w-0 items-center gap-1.5 font-medium">
                <span className="truncate font-mono text-xs">
                  {reference.slice(0, 8)}…{reference.slice(-4)}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copy payment reference"
                  className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Copy className="size-3.5" />
                </button>
              </dd>
            </div>
          ) : null}
          <Row label="Status">
            <StatusBadge status={deal.status} />
          </Row>
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={`/account/deals/${deal.id}`}>
              {paid ? "View my deal" : "Go to my deal"}
              <ArrowRight />
            </Link>
          </Button>
          {view === "slow" ? (
            <Button
              size="lg"
              variant="outline"
              disabled={query.isFetching}
              onClick={() => {
                setWaited(0)
                void query.refetch()
              }}
            >
              {query.isFetching ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Check again
            </Button>
          ) : paid ? (
            <Button asChild size="lg" variant="outline">
              <Link href="/properties">Keep exploring</Link>
            </Button>
          ) : null}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Payments are processed by Paystack. Never pay outside Veridom.
      </p>
    </div>
  )
}
