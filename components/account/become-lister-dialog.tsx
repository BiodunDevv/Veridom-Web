"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, Building2, CalendarCheck, Wallet } from "lucide-react"

import { AuthButton, AuthInput } from "@/components/auth/auth-ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMe } from "@/features/auth/hooks"
import { useCreateOrg } from "@/features/lister/org-hooks"

const perks = [
  { icon: BadgeCheck, text: "Publish verified listings" },
  { icon: CalendarCheck, text: "Manage viewings and deals" },
  { icon: Wallet, text: "Receive payouts securely" },
]

/** Create a lister without leaving the profile page. */
export function BecomeListerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const me = useMe().data
  const [name, setName] = React.useState("")
  const create = useCreateOrg(() => {
    setName("")
    onOpenChange(false)
    router.push("/lister")
  })
  const unverified = Boolean(me) && !me?.emailVerifiedAt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-6 shadow-2xl sm:max-w-[26rem] sm:p-8">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim().length >= 2) create.mutate(name.trim())
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="size-6" />
            </span>
            <DialogTitle className="text-[1.5rem] leading-tight font-semibold tracking-tight">
              Become a lister
            </DialogTitle>
            <DialogDescription className="text-balance text-foreground/60">
              Own or manage property? Set up a lister to publish verified
              listings and get paid.
            </DialogDescription>
          </div>

          <ul className="flex flex-col gap-2">
            {perks.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm font-medium"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>

          {unverified ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              Verify your email first. A verified email is needed to create a
              lister.
            </p>
          ) : (
            <AuthInput
              id="lister-name"
              icon={Building2}
              label="Lister name, e.g. Lekki Homes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={80}
              autoComplete="organization"
              required
            />
          )}

          <AuthButton
            type="submit"
            loading={create.isPending}
            disabled={unverified || name.trim().length < 2}
          >
            Create lister
          </AuthButton>
          <p className="text-center text-xs text-muted-foreground">
            You&apos;ll be the owner, and can invite your team later. You can
            have up to 5 listers.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
