"use client"

import {
  Banknote,
  CheckCircle2,
  Landmark,
  Loader2,
  ShieldCheck,
  Timer,
  UserCheck,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { ListerHero } from "@/components/lister/lister-ui"
import { inputClass } from "@/components/site/field"
import { Button } from "@/components/ui/button"
import { PatternBg } from "@/components/ui/pattern-bg"
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
  const account = usePayoutAccount(true).data
  const save = useSavePayout()
  const hasAccount = Boolean(account?.accountName)

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
                  ? `•••• •••• ${account?.accountNumber?.slice(-4) ?? "••••"}`
                  : "•••• •••• ••••"}
              </p>
              <p className="mt-1 text-sm opacity-80">
                {account?.accountName ?? "Add an account to get paid"}
              </p>
            </div>
          </div>

          <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">
                {hasAccount ? "Change payout account" : "Add payout account"}
              </h2>
              <p className="text-sm text-muted-foreground">
                We look up the account holder from the bank. You don&apos;t type
                the name.
              </p>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                save.mutate({
                  accountNumber: String(data.get("accountNumber")),
                  bankCode: String(data.get("bankCode")),
                })
              }}
            >
              <input
                name="accountNumber"
                required
                inputMode="numeric"
                pattern="\d{10}"
                placeholder="10-digit account number"
                aria-label="Account number"
                className={inputClass}
              />
              <input
                name="bankCode"
                required
                placeholder="Bank code"
                aria-label="Bank code"
                className={inputClass}
              />
              <Button
                type="submit"
                disabled={save.isPending}
                className="sm:col-span-2"
              >
                {save.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                Save payout account
              </Button>
            </form>
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
