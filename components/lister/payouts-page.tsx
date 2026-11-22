"use client"

import { Banknote, Landmark, ShieldCheck, Timer, UserCheck } from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ListerHero } from "@/components/lister/lister-ui"
import { BankAccountForm } from "@/components/account/bank-account-form"
import { PatternBg } from "@/components/ui/pattern-bg"
import { bankName } from "@/lib/banks"
import { usePayoutAccount, useSavePayout } from "@/features/lister/ops-hooks"

const STEPS = [
  {
    icon: Landmark,
    title: "Add your account",
    text: "Use a Nigerian bank account in your lister's name.",
  },
  {
    icon: Timer,
    title: "48-hour cool-off",
    text: "New accounts wait 48 hours before the first payout, to keep you safe.",
  },
  {
    icon: UserCheck,
    title: "Name check",
    text: "A name that doesn't match waits for super admin approval.",
  },
  {
    icon: Banknote,
    title: "Rent is paid out",
    text: "Confirmed deals pay out to this account automatically.",
  },
]

export function PayoutsPage() {
  const accountQuery = usePayoutAccount(true)
  const account = accountQuery.data
  const save = useSavePayout()
  const hasAccount = Boolean(account)

  return (
    <>
      <ListerHero
        icon={Banknote}
        eyebrow="Payouts"
        title="Payouts"
        description="Where rent is paid out. The account holder's name must match your lister's name."
        stats={[
          {
            label: "Payout account",
            value: hasAccount ? "Added" : "Not set",
            icon: Landmark,
            tone: hasAccount ? "good" : "warn",
          },
          {
            label: "Status",
            value: account?.status
              ? account.status
                  .replaceAll("_", " ")
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())
              : "Pending",
            icon: ShieldCheck,
          },
          {
            label: "Cool-off",
            value: "48 hrs",
            icon: Timer,
            hint: "New accounts",
          },
          {
            label: "Currency",
            value: "NGN",
            icon: Banknote,
            hint: "Paid in naira",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-4">
          {accountQuery.isLoading ? (
            <Skeleton className="h-44 w-full rounded-2xl" />
          ) : (
            <div className="relative isolate flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl bg-panel p-6 text-panel-foreground shadow-lg">
              <PatternBg className="-z-10 object-right opacity-30 mix-blend-soft-light" />
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-panel-foreground/15">
                  <Landmark className="size-5" aria-hidden />
                </span>
                {account?.status ? (
                  <StatusBadge status={account.status} />
                ) : (
                  <span className="rounded-full bg-panel-foreground/15 px-2.5 py-0.5 text-xs font-medium">
                    Not added
                  </span>
                )}
              </div>
              <div>
                <p className="font-mono text-xl tracking-[0.25em] tabular-nums">
                  {hasAccount
                    ? `•••• •••• ${account?.accountLast4 ?? "••••"}`
                    : "•••• •••• ••••"}
                </p>
                <p className="mt-1 text-sm opacity-80">
                  {account?.accountName ?? "Add an account to get paid"}
                  {bankName(account?.bankCode)
                    ? ` · ${bankName(account?.bankCode)}`
                    : ""}
                </p>
              </div>
            </div>
          )}

          <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">
                {hasAccount ? "Change payout account" : "Add payout account"}
              </h2>
            </div>
            <BankAccountForm
              pending={save.isPending}
              submitLabel="Save payout account"
              onSubmit={(value) => save.mutate(value)}
            />
          </section>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6">
          <h2 className="text-lg font-semibold">How payouts work</h2>
          <ol className="flex flex-col">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative flex gap-3.5 pb-5 last:pb-0"
              >
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-9 bottom-0 left-[17px] w-px bg-border"
                  />
                ) : null}
                <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                  <step.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
