"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { DashboardShell } from "@/components/account/dashboard-shell"
import { ContinueAs } from "@/components/lister/continue-as"
import { navFor } from "@/components/lister/lister-nav"
import { OrgSwitcher } from "@/components/lister/org-switcher"
import { useMe } from "@/features/auth/hooks"
import { useMine, usePermissions } from "@/features/lister/org-hooks"

function Loading({ label }: { label: string }) {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6">
      <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-md">
        <Loader2 className="size-4 animate-spin" /> {label}
      </div>
    </main>
  )
}

/** Signed in, then a chosen lister, then the shell with a menu built from that role's permissions. */
export function ListerGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const me = useMe()
  const mine = useMine()
  const { can, org, isLoading } = usePermissions()

  React.useEffect(() => {
    if (me.isError)
      router.replace(`/?auth=login&next=${encodeURIComponent(pathname)}`)
  }, [me.isError, pathname, router])

  if (me.isPending || me.isError)
    return <Loading label="Loading your account…" />
  if (mine.isPending) return <Loading label="Loading your listers…" />
  if (!mine.data?.activeOrganizationId) return <ContinueAs />
  if (isLoading) return <Loading label="Opening your lister…" />
  if (!org) return <ContinueAs />

  return (
    <DashboardShell
      groups={navFor(can)}
      href="/lister"
      label={org.name}
      footer={
        <p className="px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Lister workspace
        </p>
      }
      headerExtra={<OrgSwitcher />}
    >
      {children}
    </DashboardShell>
  )
}
