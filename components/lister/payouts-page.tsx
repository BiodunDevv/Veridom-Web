"use client"

import { Loader2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { inputClass } from "@/components/site/field"
import { Button } from "@/components/ui/button"
import { usePayoutAccount, useSavePayout } from "@/features/lister/ops-hooks"

export function PayoutsPage() {
  const account = usePayoutAccount(true).data
  const save = useSavePayout()

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Where rent is paid out. The account holder's name must match your lister's name."
      />
      <section className="flex max-w-xl flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6">
        {account?.accountName ? (
          <div className="flex items-center justify-between rounded-lg bg-muted/60 p-4 text-sm">
            <span>
              <span className="block font-medium">{account.accountName}</span>
              <span className="text-muted-foreground">
                ••••{account.accountNumber?.slice(-4)}
              </span>
            </span>
            {account.status ? <StatusBadge status={account.status} /> : null}
          </div>
        ) : null}
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
          <p className="text-xs text-muted-foreground sm:col-span-2">
            New accounts cool off for 48 hours before the first payout. A name
            that doesn&apos;t match waits for super admin approval.
          </p>
          <Button
            type="submit"
            disabled={save.isPending}
            className="sm:col-span-2"
          >
            {save.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Save payout account
          </Button>
        </form>
      </section>
    </>
  )
}
