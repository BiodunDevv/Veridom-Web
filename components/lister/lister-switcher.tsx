"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Check,
  ChevronsUpDown,
  Crown,
  Loader2,
  LogOut,
  Plus,
  UserRound,
} from "lucide-react"

import { initialsOf } from "@/components/lister/lister-ui"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMine, useSwitchOrg } from "@/features/lister/org-hooks"
import { cn } from "@/lib/utils"

const MAX_LISTERS = 5

/** Switching, adding and leaving, in one place, shared by the phone sheet and the dock. */
function SwitcherPanel({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const mine = useMine().data
  const [pending, setPending] = React.useState<string | "me" | null>(null)
  const switchOrg = useSwitchOrg((id) => {
    onDone()
    router.push(id ? "/lister" : "/account")
  })
  const orgs = mine?.organizations ?? []
  const active = mine?.activeOrganizationId

  const go = (id: string | null) => {
    setPending(id ?? "me")
    switchOrg.mutate(id, { onError: () => setPending(null) })
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {orgs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-foreground/[0.04] px-5 py-8 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">No listers yet</p>
            <p className="text-sm text-muted-foreground">
              Create a lister to publish listings and manage viewings, deals and
              payouts.
            </p>
          </div>
          <Button
            onClick={() => {
              onDone()
              router.push("/account?lister=new")
            }}
          >
            <Plus /> Create a lister
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Your listers">
          {orgs.map((org) => {
            const isActive = org.organizationId === active
            const busy = pending === org.organizationId
            return (
              <li key={org.organizationId}>
                <button
                  type="button"
                  disabled={switchOrg.isPending}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => (isActive ? onDone() : go(org.organizationId))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[background-color,transform] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] disabled:opacity-60",
                    isActive
                      ? "border-primary/40 bg-primary/10"
                      : "bg-card hover:bg-accent"
                  )}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    {initialsOf(org.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {org.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      {org.isOwner ? (
                        <Crown className="size-3" aria-hidden />
                      ) : null}
                      {org.roleName}
                    </span>
                  </span>
                  {busy ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <Check className="size-4" /> Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      Switch
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {orgs.length > 0 && orgs.length < MAX_LISTERS ? (
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => {
            onDone()
            router.push("/account?lister=new")
          }}
        >
          <Plus /> Add a lister
          <span className="ml-auto text-xs text-muted-foreground">
            {MAX_LISTERS - orgs.length} left
          </span>
        </Button>
      ) : null}

      <div className="border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          disabled={switchOrg.isPending}
          onClick={() => go(null)}
        >
          {pending === "me" ? <Loader2 className="animate-spin" /> : <LogOut />}
          Leave lister area
        </Button>
        <p className="mt-1 px-2 text-xs text-muted-foreground">
          Go back to your customer profile. You can return any time from your
          profile.
        </p>
      </div>
    </div>
  )
}

/** Bottom sheet for phones. Controlled, so the dock can open it too. */
export function ListerSwitcherDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88svh] pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader>
          <DrawerTitle className="text-lg">Your listers</DrawerTitle>
          <DrawerDescription>
            Choose which lister you&apos;re working in.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto">
          <SwitcherPanel onDone={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** Header chip for phones: shows the current lister and opens the sheet. */
export function MobileListerChip() {
  const mine = useMine().data
  const [open, setOpen] = React.useState(false)
  const current = mine?.organizations.find(
    (o) => o.organizationId === mine.activeOrganizationId
  )

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="sm"
        className="max-w-36 gap-1.5 pl-1.5"
        onClick={() => setOpen(true)}
        aria-label="Switch lister"
      >
        <span className="grid size-5 shrink-0 place-items-center rounded-md bg-primary text-[10px] font-semibold text-primary-foreground">
          {current ? (
            initialsOf(current.name)
          ) : (
            <UserRound className="size-3" />
          )}
        </span>
        <span className="truncate">{current?.name ?? "Lister"}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
      </Button>
      <ListerSwitcherDrawer open={open} onOpenChange={setOpen} />
    </div>
  )
}
