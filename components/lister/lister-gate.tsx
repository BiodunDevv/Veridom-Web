"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { DashboardShell } from "@/components/account/dashboard-shell"
import { navFor } from "@/components/lister/lister-nav"
import { OrgSwitcher } from "@/components/lister/org-switcher"
import { ListerDock } from "@/components/lister/lister-dock"
import { NoAccess } from "@/components/lister/no-access"
import { useMe } from "@/features/auth/hooks"
import { useMine, usePermissions } from "@/features/lister/org-hooks"
import { needsForPath } from "@/lib/permissions"

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

  const hasLister = Boolean(mine.data?.organizations.length)
  const noActive = mine.isSuccess && !mine.data.activeOrganizationId
  const orgMissing = mine.isSuccess && !isLoading && !org

  React.useEffect(() => {
    if (me.isError)
      router.replace(`/?auth=login&next=${encodeURIComponent(pathname)}`)
    // No lister yet, or none chosen: the profile page handles both.
    else if (noActive || orgMissing)
      router.replace(hasLister ? "/account#listers" : "/account?lister=new")
  }, [me.isError, noActive, orgMissing, hasLister, pathname, router])

  if (me.isPending || me.isError)
    return <Loading label="Loading your account…" />
  if (mine.isPending) return <Loading label="Loading your listers…" />
  if (!mine.data?.activeOrganizationId)
    return <Loading label="Opening your profile…" />
  if (isLoading) return <Loading label="Opening your lister…" />
  if (!org) return <Loading label="Opening your profile…" />

  const needs = needsForPath(pathname)
  const allowed = !needs || can(...needs)

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
      headerExtra={
        <div className="hidden md:block">
          <OrgSwitcher />
        </div>
      }
      dock={<ListerDock />}
    >
      {allowed ? children : <NoAccess />}
    </DashboardShell>
  )
}
