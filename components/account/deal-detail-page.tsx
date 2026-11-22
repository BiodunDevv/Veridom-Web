"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Clock, Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { ReasonDialog } from "@/components/account/deal-actions"
import { BankAccountForm } from "@/components/account/bank-account-form"
import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  useCancelDeal,
  useCheckout,
  useConfirmMoveIn,
  useDeal,
  useRefundBankDetails,
  useReportProblem,
} from "@/features/deals/hooks"
import { formatCountdown, useCountdown } from "@/hooks/use-countdown"
import { dealsApi, type Deal } from "@/lib/api/deals"
import { getApiErrorMessage } from "@/lib/api/client"
import { formatDate, formatNaira } from "@/lib/format"
import { DetailSkeleton } from "@/components/ui/page-skeletons"

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function PayPanel({ deal }: { deal: Deal }) {
  const checkout = useCheckout()
  const left = useCountdown(deal.holdExpiresAt)

  return (
    <Panel title="Complete your payment">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" />
        {left > 0 ? (
          <>
            Held for you for{" "}
            <span className="font-semibold text-foreground">
              {formatCountdown(left)}
            </span>
          </>
        ) : (
          "The hold is ending. Pay now to try to keep it."
        )}
      </p>
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
        You&apos;ll pay securely with Paystack. After paying, this page updates
        by itself.
      </p>
    </Panel>
  )
}

function MoveInPanel({ deal }: { deal: Deal }) {
  const [code, setCode] = React.useState("")
  const confirm = useConfirmMoveIn(deal.id)

  return (
    <Panel title="Move-in handover">
      <p className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
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
      >
        {confirm.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Confirm move-in
      </Button>
    </Panel>
  )
}

function RefundPanel({
  dealId,
  refundId,
}: {
  dealId: string
  refundId: string
}) {
  const save = useRefundBankDetails(dealId, refundId)

  return (
    <Panel title="Where should we send your refund?">
      <BankAccountForm
        pending={save.isPending}
        submitLabel="Send my refund here"
        onSubmit={(value) => save.mutate(value)}
      />
    </Panel>
  )
}

export function DealDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const dealQuery = useDeal(id)
  const cancel = useCancelDeal(id)
  const report = useReportProblem(id)
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

  if (dealQuery.isPending) {
    return <DetailSkeleton />
  }
  if (!deal)
    return <RetryState label="this deal" onRetry={() => dealQuery.refetch()} />

  const status = deal.status
  const canCancel = status === "HELD" || status === "PAID"
  const canReport = status === "PAID" || status === "COMPLETED"

  return (
    <>
      <Link
        href="/account/deals"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All deals
      </Link>
      <PageHeader
        title={deal.listing?.title ?? "Your deal"}
        description={
          deal.moveInDate ? `Move-in ${formatDate(deal.moveInDate)}` : undefined
        }
        actions={<StatusBadge status={status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          {status === "HELD" ? <PayPanel deal={deal} /> : null}
          {status === "PAID" ? <MoveInPanel deal={deal} /> : null}
          {deal.refund?.status === "NEEDS_ATTENTION" ? (
            <RefundPanel dealId={id} refundId={deal.refund.id} />
          ) : null}
          {status === "EXPIRED" ? (
            <Panel title="This hold expired">
              <p className="text-sm text-muted-foreground">
                If you paid just now, don&apos;t worry: a late payment is
                honoured when the property is still free, otherwise it&apos;s
                refunded.
              </p>
            </Panel>
          ) : null}
          {status === "DISPUTED" ? (
            <Panel title="Under review">
              <p className="text-sm text-muted-foreground">
                The payout is on hold while our team looks into your report.
              </p>
            </Panel>
          ) : null}
          {status === "COMPLETED" ? (
            <Panel title="Staying on?">
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
            </Panel>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          <Panel title="Summary">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium">{formatNaira(deal.totalKobo)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">You pay</dt>
                <dd className="font-semibold">
                  {formatNaira(deal.payKobo ?? deal.totalKobo)}
                </dd>
              </div>
              {deal.commissionCustomerKobo ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Service fee</dt>
                  <dd className="font-medium">
                    {formatNaira(deal.commissionCustomerKobo)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Panel>

          {canCancel || canReport ? (
            <div className="flex flex-wrap gap-2">
              {canCancel ? (
                <Button
                  variant="outline"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(undefined)}
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
    </>
  )
}
