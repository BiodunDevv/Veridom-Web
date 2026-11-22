"use client"

import * as React from "react"
import { CheckCircle2, Hash, Landmark, Loader2 } from "lucide-react"

import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { BANKS } from "@/lib/banks"

/** Bank dropdown and a 10-digit account number: shared by payouts and refunds. */
export function BankAccountForm({
  onSubmit,
  pending,
  submitLabel,
}: {
  onSubmit: (value: { accountNumber: string; bankCode: string }) => void
  pending?: boolean
  submitLabel: string
}) {
  const [bankCode, setBankCode] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const valid = bankCode !== "" && /^\d{10}$/.test(accountNumber)

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit({ accountNumber, bankCode })
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bank" className="text-sm font-semibold">
          Bank
        </label>
        <FormSelect
          id="bank"
          name="bankCode"
          placeholder="Choose your bank"
          icon={undefined}
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          options={BANKS.map((b) => ({ value: b.code, label: b.name }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="account-number" className="text-sm font-semibold">
          Account number
        </label>
        <InputGroup className="h-12 rounded-lg bg-background">
          <InputGroupAddon align="inline-start" className="pl-3.5">
            <Hash className="size-[18px] text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            id="account-number"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="0123456789"
            className="h-full font-mono tracking-widest md:text-base"
          />
          <InputGroupAddon align="inline-end" className="pr-3.5">
            {valid ? (
              <CheckCircle2 className="size-4 text-primary" aria-hidden />
            ) : (
              <span className="text-xs text-muted-foreground tabular-nums">
                {accountNumber.length}/10
              </span>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
        <Landmark className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        We look up the account holder&apos;s name from the bank. You don&apos;t
        type it.
      </p>
      <Button
        type="submit"
        disabled={!valid || pending}
        className="sm:col-span-2"
      >
        {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        {submitLabel}
      </Button>
    </form>
  )
}
