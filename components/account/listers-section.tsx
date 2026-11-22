"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Crown,
  Loader2,
  Plus,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react"

import { PatternBg } from "@/components/ui/pattern-bg"
import { Button } from "@/components/ui/button"
import { useMine, useSwitchOrg } from "@/features/lister/org-hooks"
import { cn } from "@/lib/utils"

const MAX_LISTERS = 5

const perks = [
  { icon: BadgeCheck, text: "Publish verified listings" },
  { icon: CalendarCheck, text: "Manage viewings and deals" },
  { icon: Wallet, text: "Receive payouts securely" },
]

const initialsOfName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "L"

function RoleBadge({ role, owner }: { role: string; owner: boolean }) {
  const Icon = owner
    ? Crown
    : role.toLowerCase() === "manager"
      ? ShieldCheck
      : UserRound
  return (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      <Icon className="size-3.5" />
      {role}
    </span>
  )
}

/** Listers the person belongs to, or the invitation to create the first one. */
export function ListersSection({ onCreate }: { onCreate: () => void }) {
  const router = useRouter()
  const mine = useMine().data
  const orgs = mine?.organizations ?? []
  const activeId = mine?.activeOrganizationId ?? null
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const switchOrg = useSwitchOrg(() => router.push("/lister"))
  const atLimit = orgs.length >= MAX_LISTERS

  const open = (id: string) => {
    setPendingId(id)
    switchOrg.mutate(id, { onSettled: () => setPendingId(null) })
  }

  // First lister: a welcoming call to action.
  if (!orgs.length) {
    return (
      <section
        id="listers"
        className="relative scroll-mt-28 overflow-hidden rounded-2xl bg-card p-5 shadow-md sm:p-7"
      >
        <PatternBg className="object-right" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Crown className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Join as a lister
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Own or manage property? Create a lister to publish verified
                listings and receive payouts.
              </p>
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-3">
            {perks.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 rounded-xl bg-background/70 px-3.5 py-3 text-sm font-medium backdrop-blur-sm"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
          <Button className="self-start" onClick={onCreate}>
            <Plus /> Become a lister
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section
      id="listers"
      className="relative scroll-mt-28 overflow-hidden rounded-2xl bg-card p-5 shadow-md sm:p-6"
    >
      <PatternBg className="object-right opacity-20 dark:opacity-40" />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Your listers
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a lister to manage its listings, viewings and payouts.
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {orgs.length} of {MAX_LISTERS}
          </span>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {orgs.map((org) => {
            const active = org.organizationId === activeId
            const busy = pendingId === org.organizationId
            return (
              <li key={org.organizationId}>
                <button
                  type="button"
                  disabled={switchOrg.isPending}
                  onClick={() => open(org.organizationId)}
                  className={cn(
                    "group flex h-full w-full flex-col gap-4 rounded-2xl border bg-background/80 p-4 text-left backdrop-blur-sm transition-[translate,box-shadow,border-color] outline-none hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-70",
                    active && "border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-base font-semibold text-primary">
                      {initialsOfName(org.name)}
                    </span>
                    {active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        <span className="size-1.5 rounded-full bg-primary" />
                        Active now
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col gap-2">
                    <p className="truncate text-base font-semibold">
                      {org.name}
                    </p>
                    <RoleBadge role={org.roleName} owner={org.isOwner} />
                  </div>
                  <span className="mt-auto flex items-center justify-between border-t pt-3 text-sm font-semibold text-primary">
                    {active ? "Continue to dashboard" : "Open dashboard"}
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </span>
                </button>
              </li>
            )
          })}

          <li>
            <button
              type="button"
              onClick={onCreate}
              disabled={atLimit}
              className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-background/40 p-4 text-center transition-colors outline-none hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                <Plus className="size-5" />
              </span>
              <span className="text-sm font-semibold">Add a lister</span>
              <span className="text-xs text-muted-foreground">
                {atLimit
                  ? "You have reached the limit of 5"
                  : `${MAX_LISTERS - orgs.length} more available`}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </section>
  )
}
