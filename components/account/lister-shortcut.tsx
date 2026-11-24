"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Crown,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMine, useSwitchOrg } from "@/features/lister/org-hooks"
import { cn } from "@/lib/utils"

const initialsOfName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "L"

/** Everything needed to jump straight into a lister from anywhere. */
function useEnterLister() {
  const router = useRouter()
  const mine = useMine().data
  const orgs = mine?.organizations ?? []
  const activeId = mine?.activeOrganizationId ?? null
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const switchOrg = useSwitchOrg(() => router.push("/lister"))

  const enter = (id: string) => {
    // Already acting as this lister: no need to ask the server again.
    if (id === activeId) return router.push("/lister")
    setPendingId(id)
    switchOrg.mutate(id, { onSettled: () => setPendingId(null) })
  }

  return { orgs, activeId, pendingId, enter }
}

/** Header button for people who belong to a lister: one click to the lister area. */
export function ListerShortcutButton({ className }: { className?: string }) {
  const { orgs, activeId, pendingId, enter } = useEnterLister()
  if (!orgs.length) return null

  const single = orgs.length === 1
  const label = single ? orgs[0].name : "Lister area"

  const trigger = (
    <Button
      size="sm"
      variant="outline"
      className={cn("hidden max-w-52 gap-2 lg:inline-flex", className)}
      onClick={single ? () => enter(orgs[0].organizationId) : undefined}
      disabled={Boolean(pendingId)}
    >
      {pendingId ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Building2 className="size-4 text-primary" />
      )}
      <span className="truncate">{label}</span>
      {single ? (
        <ArrowRight className="size-3.5 text-muted-foreground" />
      ) : (
        <ChevronDown className="size-3.5 text-muted-foreground" />
      )}
    </Button>
  )

  if (single) return trigger

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Continue as</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.organizationId}
            onSelect={() => enter(org.organizationId)}
            className="gap-3 py-2"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              {initialsOfName(org.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{org.name}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {org.isOwner ? <Crown className="size-3" /> : null}
                {org.roleName}
                {org.organizationId === activeId ? " · current" : ""}
              </span>
            </span>
            {pendingId === org.organizationId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/account#listers">Manage listers</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Big tappable cards for the phone "More" panel: one per lister, straight in. */
export function ListerShortcutCards() {
  const { orgs, activeId, pendingId, enter } = useEnterLister()
  if (!orgs.length) return null

  return (
    <div className="mb-2 flex flex-col gap-2">
      {orgs.slice(0, 3).map((org) => (
        <button
          key={org.organizationId}
          type="button"
          onClick={() => enter(org.organizationId)}
          disabled={Boolean(pendingId)}
          className="flex items-center gap-3 rounded-2xl bg-primary p-3.5 text-left text-primary-foreground shadow-md transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98] disabled:opacity-70"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/15 text-sm font-semibold">
            {initialsOfName(org.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold tracking-wide uppercase opacity-80">
              {org.organizationId === activeId ? "Lister area" : "Continue as"}
            </span>
            <span className="block truncate font-semibold">{org.name}</span>
            <span className="block truncate text-xs opacity-80">
              {org.roleName}
            </span>
          </span>
          {pendingId === org.organizationId ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ArrowRight className="size-5" />
          )}
        </button>
      ))}
      {orgs.length > 3 ? (
        <a
          href="/account#listers"
          className="text-center text-xs font-semibold text-muted-foreground"
        >
          See all {orgs.length} listers
        </a>
      ) : null}
    </div>
  )
}
