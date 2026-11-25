"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  Handshake,
  HandCoins,
  KeyRound,
  Loader2,
  Receipt,
  ShieldCheck,
  Timer,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/account/status-badge"
import { ListerHero } from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { DetailSkeleton } from "@/components/ui/page-skeletons"
import { useHandoverCode, useListerDeal } from "@/features/lister/ops-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import { formatCalendarDate, formatDate, formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

const TRANSFER: Record<string, { label: string; hint: string }> = {
  QUEUED: {
    label: "Queued",
    hint: "Waiting in line. It goes out after a short undo window.",
  },
  BLOCKED: {
    label: "On hold",
    hint: "Held back until the issue below is fixed.",
  },
  SENDING: { label: "Sending", hint: "On its way to your bank account." },
  SENT: { label: "Sent", hint: "The money has been sent to your account." },
  FAILED: { label: "Failed", hint: "The transfer did not go through." },
}

type Step = {
  key: string
  title: string
  detail?: string
  state: "done" | "current" | "todo" | "problem"
}

function Card({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-md sm:p-6",
        className
      )}
    >
      <h2 className="flex items-center gap-2.5 text-base font-semibold sm:text-lg">
        {Icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        ) : null}
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({
  label,
  children,
  strong,
}: {
  label: string
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right tabular-nums",
          strong ? "text-base font-semibold" : "font-medium"
        )}
      >
        {children}
      </dd>
    </div>
  )
}

/** A vertical timeline: paid, handover, payout. */
function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.key} className="flex gap-3.5">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "relative grid size-7 shrink-0 place-items-center rounded-full text-xs",
                step.state === "done" && "bg-primary text-primary-foreground",
                step.state === "current" &&
                  "bg-primary/15 text-primary ring-2 ring-primary",
                step.state === "todo" && "bg-muted text-muted-foreground",
                step.state === "problem" && "bg-destructive/15 text-destructive"
              )}
            >
              {step.state === "done" ? (
                <Check className="size-4" />
              ) : step.state === "problem" ? (
                <CircleAlert className="size-4" />
              ) : (
                i + 1
              )}
              {step.state === "current" ? (
                <span className="absolute inset-0 rounded-full bg-primary/30 [animation-duration:2.4s] motion-safe:animate-ping" />
              ) : null}
            </span>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "my-1 w-0.5 flex-1 rounded-full",
                  step.state === "done" ? "bg-primary" : "bg-muted"
                )}
              />
            ) : null}
          </div>
          <div className={cn("pb-5", i === steps.length - 1 && "pb-0")}>
            <p
              className={cn(
                "text-sm font-medium",
                step.state === "todo" && "text-muted-foreground"
              )}
            >
              {step.title}
            </p>
            {step.detail ? (
              <p
                className={cn(
                  "text-sm",
                  step.state === "problem"
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {step.detail}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** The six digits, shown once, to read out to the customer at the property. */
function HandoverCard({ dealId }: { dealId: string }) {
  const [code, setCode] = React.useState<{
    code: string
    expiresAt: string
  } | null>(null)
  const generate = useHandoverCode(setCode)

  const copy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code.code)
      toast.success("Code copied.")
    } catch {
      toast.error("Could not copy the code.")
    }
  }

  return (
    <Card title="Handover code" icon={KeyRound}>
      {code ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-muted/60 py-6 sm:gap-2">
            {code.code.split("").map((digit, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
                className="grid h-14 w-10 animate-in place-items-center rounded-lg bg-background font-mono text-3xl font-semibold shadow-sm ring-1 ring-border zoom-in-90 fade-in sm:w-12"
              >
                {digit}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Expires {formatDate(code.expiresAt)}</span>
            <Button size="sm" variant="outline" onClick={copy}>
              <Copy /> Copy
            </Button>
          </div>
          <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-muted-foreground">
            Shown once. Read it out to the customer in person at the property.
            Never send it in chat, messages or email.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            When the customer arrives for move-in, create a 6-digit code and
            give it to them at the property. They enter it once they have the
            keys, and your payout is released.
          </p>
          <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <li>• Available from the day before move-in.</li>
            <li>• Only after the customer&apos;s viewing is closed.</li>
            <li>• Valid for 24 hours and shown only once.</li>
          </ul>
          <Button
            className="self-start"
            disabled={generate.isPending}
            onClick={() => generate.mutate(dealId)}
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound />
            )}
            Create handover code
          </Button>
        </>
      )}
    </Card>
  )
}

export function ListerDealDetailPage({ id }: { id: string }) {
  const query = useListerDeal(id)
  const { can } = usePermissions()
  const deal = query.data

  if (query.isPending) return <DetailSkeleton />
  if (!deal)
    return <RetryState label="this deal" onRetry={() => query.refetch()} />

  const title = deal.listing?.title ?? "Deal"
  const transfer = deal.transfer
  const transferInfo = transfer ? TRANSFER[transfer.status] : undefined
  const paid = deal.status === "PAID" || deal.status === "COMPLETED"
  const handedOver =
    deal.status === "COMPLETED" || Boolean(deal.handoverConfirmedAt)

  const steps: Step[] = [
    {
      key: "paid",
      title: paid ? "Customer paid" : "Waiting for payment",
      detail: deal.paidAt
        ? formatDate(deal.paidAt)
        : deal.status === "HELD"
          ? "The property is on hold for the customer."
          : undefined,
      state: paid ? "done" : "current",
    },
    {
      key: "handover",
      title: handedOver ? "Keys handed over" : "Hand over the keys",
      detail: handedOver
        ? deal.handoverConfirmedAt
          ? formatDate(deal.handoverConfirmedAt)
          : "Move-in confirmed"
        : paid
          ? "Create the handover code on move-in day."
          : undefined,
      state: handedOver ? "done" : paid ? "current" : "todo",
    },
    {
      key: "payout",
      title: transferInfo
        ? `Payout ${transferInfo.label.toLowerCase()}`
        : "Payout",
      detail: transfer?.blockReason
        ? transfer.blockReason
        : (transferInfo?.hint ??
          "Starts once the deal completes, then waits a short undo window."),
      state:
        transfer?.status === "SENT"
          ? "done"
          : transfer?.status === "BLOCKED" || transfer?.status === "FAILED"
            ? "problem"
            : transfer
              ? "current"
              : "todo",
    },
  ]

  return (
    <>
      <Link
        href="/lister/deals"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All deals
      </Link>

      <ListerHero
        icon={Handshake}
        eyebrow={deal.kind === "RENEWAL" ? "Renewal" : "Deal"}
        title={title}
        description={
          deal.moveInDate
            ? `Move-in ${formatCalendarDate(deal.moveInDate)}`
            : undefined
        }
        actions={
          <span className="hidden sm:inline-flex">
            <StatusBadge status={deal.status} />
          </span>
        }
        stats={[
          {
            label: "You receive",
            value: formatNaira(deal.listerAmountKobo ?? deal.totalKobo),
            icon: HandCoins,
            tone: "good",
            hint: "After the Veridom fee",
          },
          {
            label: "Rental total",
            value: formatNaira(deal.totalKobo),
            icon: Receipt,
          },
          {
            label: "Payout",
            value: transferInfo?.label ?? "Not started",
            icon: Banknote,
            tone:
              transfer?.status === "BLOCKED" || transfer?.status === "FAILED"
                ? "warn"
                : "default",
          },
          {
            label: "Status",
            value: deal.status
              .replace("_", " ")
              .toLowerCase()
              .replace(/^./, (c) => c.toUpperCase()),
            icon: BadgeCheck,
            tone: deal.status === "PAID" ? "good" : "default",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          {deal.status === "PAID" && can("deal:manage") ? (
            <HandoverCard dealId={deal.id} />
          ) : null}

          <Card title="Progress" icon={Timer}>
            <Timeline steps={steps} />
            {transfer?.releaseAfter ? (
              <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                <Clock3 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                Payout released after {formatDate(transfer.releaseAfter)}.
              </p>
            ) : null}
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Card title="Money" icon={Receipt}>
            <dl className="flex flex-col gap-2.5">
              <Row label="Rental total">{formatNaira(deal.totalKobo)}</Row>
              {deal.commissionListerKobo ? (
                <Row label="Veridom fee (your half)">
                  − {formatNaira(deal.commissionListerKobo)}
                </Row>
              ) : null}
              <div className="my-1 border-t" />
              <Row label="You receive" strong>
                {formatNaira(deal.listerAmountKobo ?? deal.totalKobo)}
              </Row>
            </dl>
            <p className="text-xs text-muted-foreground">
              Large payouts are sent as several transfers; this shows the latest
              one.
            </p>
          </Card>

          <section className="relative isolate overflow-hidden rounded-2xl bg-card p-4 shadow-md sm:p-6">
            <h2 className="mb-3 flex items-center gap-2.5 text-base font-semibold sm:text-lg">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>
              About this deal
            </h2>
            <dl className="flex flex-col gap-2.5">
              <Row label="Property">
                {deal.listing?.id ? (
                  <Link
                    href={`/lister/listings/${deal.listing.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </Row>
              {deal.rentPeriod ? (
                <Row label="Rent">
                  Per {deal.rentPeriod === "MONTH" ? "month" : "year"}
                </Row>
              ) : null}
              {deal.tenancyStart && deal.tenancyEnd ? (
                <Row label="Tenancy">
                  {formatCalendarDate(deal.tenancyStart)} –{" "}
                  {formatCalendarDate(deal.tenancyEnd)}
                </Row>
              ) : null}
              {deal.createdAt ? (
                <Row label="Reserved">{formatDate(deal.createdAt)}</Row>
              ) : null}
            </dl>
          </section>
        </aside>
      </div>
    </>
  )
}
