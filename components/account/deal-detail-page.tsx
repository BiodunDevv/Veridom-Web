"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { BankAccountForm } from "@/components/account/bank-account-form"
import { ReasonDialog } from "@/components/account/deal-actions"
import { StatusBadge } from "@/components/account/status-badge"
import { useConfirm } from "@/components/lister/confirm-dialog"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { DetailSkeleton } from "@/components/ui/page-skeletons"
import {
  useCancelDeal,
  useCheckout,
  useConfirmMoveIn,
  useDeal,
  useRefundBankDetails,
  useReportProblem,
} from "@/features/deals/hooks"
import { formatCountdown, useCountdown } from "@/hooks/use-countdown"
import { getApiErrorMessage } from "@/lib/api/client"
import { dealsApi, type Deal } from "@/lib/api/deals"
import { formatDate, formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

const HOLD_MS = 30 * 60_000
const STEPS = ["Reserved", "Paid", "Move-in", "Done"]
const ENDED: Record<string, string> = {
  EXPIRED: "The hold ended before payment was made.",
  CANCELLED: "This deal was cancelled.",
  REFUND_DUE: "A refund is on its way to you.",
  REFUNDED: "This deal was refunded.",
  DISPUTED: "A problem was reported. The payout is paused while we review.",
}

function Card({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-6">
      {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
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

/** Four thin segments and one line of text: where the deal is, nothing more. */
function Progress({ status }: { status: string }) {
  if (ENDED[status])
    return <p className="text-sm text-muted-foreground">{ENDED[status]}</p>
  const step = status === "HELD" ? 1 : status === "PAID" ? 2 : 4
  const label = step >= 4 ? "Completed" : STEPS[step]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5" aria-hidden>
        {STEPS.map((name, i) => (
          <span
            key={name}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-500",
              i < step || step >= 4 ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {step >= 4 ? (
          "All done."
        ) : (
          <>
            Step {step + 1} of 4 ·{" "}
            <span className="font-medium text-foreground">{label}</span>
          </>
        )}
      </p>
    </div>
  )
}

function PayCard({ deal }: { deal: Deal }) {
  const checkout = useCheckout()
  const left = useCountdown(deal.holdExpiresAt)
  const pct = Math.min(100, Math.max(0, ((left * 1000) / HOLD_MS) * 100))

  return (
    <Card title="Complete your payment">
      <div className="flex flex-col gap-2">
        <p className="flex items-baseline justify-between text-sm text-muted-foreground">
          {left > 0 ? "Held for you" : "The hold is ending"}
          {left > 0 ? (
            <span
              className={cn(
                "text-lg font-semibold text-foreground tabular-nums",
                left < 300 && "text-destructive"
              )}
            >
              {formatCountdown(left)}
            </span>
          ) : null}
        </p>
        <div
          role="progressbar"
          aria-label="Time left on your hold"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          className="h-1 overflow-hidden rounded-full bg-muted"
        >
          <span
            className={cn(
              "block h-full rounded-full transition-[width] duration-1000 ease-linear",
              left < 300 ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <Button
        size="lg"
        disabled={checkout.isPending}
        onClick={() => checkout.mutate(deal.id)}
      >
        {checkout.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : null}
        Pay {formatNaira(deal.payKobo ?? deal.totalKobo)}
      </Button>
      <p className="text-xs text-muted-foreground">
        Secure payment with Paystack. This page updates by itself afterwards.
      </p>
    </Card>
  )
}

function MoveInCard({ deal }: { deal: Deal }) {
  const [code, setCode] = React.useState("")
  const confirm = useConfirmMoveIn(deal.id)

  return (
    <Card title="Move-in handover">
      <p className="text-sm text-muted-foreground">
        Only enter this code after you have the keys and have seen the property.
        Veridom never asks for it.
      </p>
      <InputOTP
        maxLength={6}
        value={code}
        onChange={setCode}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="6-digit handover code"
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, i) => (
            <InputOTPSlot key={i} index={i} className="size-11 text-lg" />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Button
        disabled={code.length !== 6 || confirm.isPending}
        onClick={() => confirm.mutate(code, { onSettled: () => setCode("") })}
        className="self-start"
      >
        {confirm.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Confirm move-in
      </Button>
    </Card>
  )
}

function RefundCard({
  dealId,
  refundId,
}: {
  dealId: string
  refundId: string
}) {
  const save = useRefundBankDetails(dealId, refundId)
  return (
    <Card title="Where should we send your refund?">
      <BankAccountForm
        pending={save.isPending}
        submitLabel="Send my refund here"
        onSubmit={(value) => save.mutate(value)}
      />
    </Card>
  )
}

export function DealDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const dealQuery = useDeal(id)
  const cancel = useCancelDeal(id)
  const report = useReportProblem(id)
  const confirm = useConfirm()
  const renewKey = React.useRef<string | null>(null)

  const renew = useMutation({
    mutationFn: () => {
      renewKey.current ??= crypto.randomUUID()
      return dealsApi.renew(id, renewKey.current)
    },
    onSuccess: (next) => {
      renewKey.current = null
      toast.success("Renewal created. Complete the payment to confirm.")
      router.push(`/account/deals/${next.id}`)
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not start the renewal.")),
  })

  const deal = dealQuery.data

  if (dealQuery.isPending) return <DetailSkeleton />
  if (!deal)
    return <RetryState label="this deal" onRetry={() => dealQuery.refetch()} />

  const status = deal.status
  const canCancel = status === "HELD" || status === "PAID"
  const canReport = status === "PAID" || status === "COMPLETED"
  const title = deal.listing?.title ?? "Your deal"
  const listingId = deal.listing?.id ?? deal.listingId

  return (
    <>
      <Link
        href="/account/deals"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All deals
      </Link>

      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <StatusBadge status={status} />
        </div>
        {deal.moveInDate ? (
          <p className="text-sm text-muted-foreground">
            Move-in {formatDate(deal.moveInDate)}
          </p>
        ) : null}
      </header>

      <Card>
        <Progress status={status} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          {status === "HELD" ? <PayCard deal={deal} /> : null}
          {status === "PAID" ? <MoveInCard deal={deal} /> : null}
          {deal.refund?.status === "NEEDS_ATTENTION" ? (
            <RefundCard dealId={id} refundId={deal.refund.id} />
          ) : null}
          {status === "EXPIRED" ? (
            <Card title="This hold expired">
              <p className="text-sm text-muted-foreground">
                If you paid just now, don&apos;t worry: a late payment is
                honoured when the property is still free, otherwise it&apos;s
                refunded.
              </p>
            </Card>
          ) : null}
          {status === "DISPUTED" ? (
            <Card title="Under review">
              <p className="text-sm text-muted-foreground">
                The payout is on hold while our team looks into your report.
              </p>
            </Card>
          ) : null}
          {status === "COMPLETED" ? (
            <Card title="Staying on?">
              <p className="text-sm text-muted-foreground">
                Renew to pay the next rent and recurring fees.
              </p>
              <Button
                disabled={renew.isPending}
                onClick={() => renew.mutate()}
                className="self-start"
              >
                {renew.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Renew this rental
              </Button>
            </Card>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          <Card title="Summary">
            <dl className="flex flex-col gap-2.5">
              <Row label="Property">
                {listingId ? (
                  <Link
                    href={`/properties/${listingId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </Row>
              {deal.organizationName ? (
                <Row label="Listed by">{deal.organizationName}</Row>
              ) : null}
              {deal.tenancyStart && deal.tenancyEnd ? (
                <Row label="Tenancy">
                  {formatDate(deal.tenancyStart)} –{" "}
                  {formatDate(deal.tenancyEnd)}
                </Row>
              ) : null}
              <div className="my-1 border-t" />
              <Row label="Rental total">{formatNaira(deal.totalKobo)}</Row>
              {deal.commissionCustomerKobo ? (
                <Row label="Service fee">
                  {formatNaira(deal.commissionCustomerKobo)}
                </Row>
              ) : null}
              <Row label="You pay" strong>
                {formatNaira(deal.payKobo ?? deal.totalKobo)}
              </Row>
            </dl>
          </Card>

          {canCancel || canReport ? (
            <div className="flex flex-wrap gap-2">
              {canCancel ? (
                <Button
                  variant="outline"
                  disabled={cancel.isPending}
                  onClick={() =>
                    confirm.ask({
                      title: "Cancel this deal?",
                      description:
                        status === "HELD"
                          ? "The property is released and you won't be charged."
                          : "Within 24 hours of paying you get a full refund. After that you'll need to report a problem instead.",
                      confirmLabel: "Cancel deal",
                      tone: "danger",
                      run: () => cancel.mutateAsync(undefined),
                    })
                  }
                >
                  {cancel.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Cancel deal
                </Button>
              ) : null}
              {canReport ? (
                <ReasonDialog
                  trigger="Report a problem"
                  title="Report a problem"
                  description="This freezes the payout to the lister while we review."
                  confirmLabel="Report problem"
                  variant="destructive"
                  pending={report.isPending}
                  onConfirm={(reason) => report.mutate(reason)}
                />
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
      {confirm.dialog}
    </>
  )
}
