"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import {
  ArrowLeft,
  CalendarCheck,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react"
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
import { PatternBg } from "@/components/ui/pattern-bg"
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
import { formatCalendarDate, formatDate, formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

const HOLD_MS = 30 * 60_000
const DAY_MS = 86_400_000

/** Unsplash photos that suit each stage of a deal. */
const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`
const IMAGES = {
  pay: "photo-1556742049-0cfed4f6a45d", // paying with a phone at a counter
  keys: "photo-1560518883-ce09059eeffa", // keys beside a model home
  papers: "photo-1450101499163-c8848c66ca85", // signing papers
}
const STEPS = ["Reserved", "Paid", "Move-in", "Done"]
const ENDED: Record<string, string> = {
  EXPIRED: "The hold ended before payment was made.",
  CANCELLED: "This deal was cancelled.",
  REFUND_DUE: "A refund is on its way to you.",
  REFUNDED: "This deal was refunded.",
  DISPUTED: "A problem was reported. The payout is paused while we review.",
}

const CHANNELS: Record<string, string> = {
  bank_transfer: "bank transfer",
  card: "card",
  ussd: "USSD",
  bank: "bank",
  mobile_money: "mobile money",
}

/** A neat rounded picture at the top of a card, with a small caption. */
function Photo({ id, caption }: { id: string; caption?: string }) {
  const [failed, setFailed] = React.useState(false)
  if (failed) return null
  return (
    <div className="relative h-32 overflow-hidden rounded-xl bg-muted sm:h-40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo(id)}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      {caption ? (
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {caption}
        </span>
      ) : null}
    </div>
  )
}

function Card({
  title,
  image,
  caption,
  children,
}: {
  title?: string
  /** An Unsplash photo id shown at the top of the card. */
  image?: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-5">
      {image ? <Photo id={image} caption={caption} /> : null}
      <div className="flex flex-col gap-4 sm:px-1">
        {title ? (
          <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
        ) : null}
        {children}
      </div>
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
    <Card
      title="Complete your payment"
      image={IMAGES.pay}
      caption="Secure payment"
    >
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
  // Without a code the deal completes by itself 72 hours after move-in.
  const autoDone = deal.moveInDate
    ? new Date(
        Date.parse(deal.moveInDate.slice(0, 10) + "T12:00:00Z") + 3 * DAY_MS
      )
    : null

  return (
    <Card
      title="Move-in handover"
      image={IMAGES.keys}
      caption="Keys on move-in day"
    >
      <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
        <p className="text-sm font-semibold">Where do I get the code?</p>
        <ol className="flex flex-col gap-2.5 text-sm text-muted-foreground">
          {[
            [CalendarCheck, "Meet the lister at the property on move-in day."],
            [
              UserRound,
              "They create a 6-digit code in their Veridom account and show it to you. It's valid for 24 hours.",
            ],
            [
              KeyRound,
              "Once you have the keys and have seen the property, enter it below.",
            ],
          ].map(([Icon, text], i) => {
            const I = Icon as typeof KeyRound
            return (
              <li key={i} className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <I className="size-3.5" aria-hidden />
                </span>
                <span className="pt-0.5 leading-snug">{text as string}</span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-3">
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
          {confirm.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Confirm move-in
        </Button>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <span>
          Only enter the code after you have the keys. Veridom never asks for
          it. No code?{" "}
          {autoDone
            ? `The deal completes by itself on ${formatCalendarDate(autoDone.toISOString())} unless you report a problem.`
            : "The deal completes by itself 72 hours after move-in unless you report a problem."}
        </span>
      </p>
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

      <header className="relative isolate flex flex-col gap-1.5 overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-6">
        <PatternBg className="-z-10 [mask-image:linear-gradient(to_left,black,transparent_80%)]" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <StatusBadge status={status} />
        </div>
        {deal.moveInDate ? (
          <p className="text-sm text-muted-foreground">
            Move-in {formatCalendarDate(deal.moveInDate)}
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
            <Card title="Staying on?" image={IMAGES.papers} caption="Renewal">
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
              {deal.rentPeriod ? (
                <Row label="Rent">
                  Per {deal.rentPeriod === "MONTH" ? "month" : "year"}
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
              {deal.paidAt ? (
                <Row label="Paid">
                  {formatDate(deal.paidAt)}
                  {deal.payment?.channel
                    ? ` · ${CHANNELS[deal.payment.channel] ?? deal.payment.channel.replace("_", " ")}`
                    : ""}
                </Row>
              ) : null}
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
