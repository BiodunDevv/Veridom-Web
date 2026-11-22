"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { ShellSkeleton } from "@/components/ui/page-skeletons"
import { DashboardShell } from "@/components/account/dashboard-shell"
import { navFor } from "@/components/lister/lister-nav"
import { MobileListerChip } from "@/components/lister/lister-switcher"
import { OrgSwitcher } from "@/components/lister/org-switcher"
import { ListerDock } from "@/components/lister/lister-dock"
import { NoAccess } from "@/components/lister/no-access"
import { useMe } from "@/features/auth/hooks"
import {
  useMine,
  usePermissions,
  useSwitchOrg,
} from "@/features/lister/org-hooks"
import { needsForPath } from "@/lib/permissions"

const Loading = ({ label }: { label: string }) => (
  <ShellSkeleton label={label} />
)

/** Signed in, then a chosen lister, then the shell with a menu built from that role's permissions. */
export function ListerGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const me = useMe()
  const mine = useMine()
  const { can, org, isLoading } = usePermissions()
  const leave = useSwitchOrg(() => router.push("/account"))

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
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <button
            type="button"
            onClick={() => leave.mutate(null)}
            disabled={leave.isPending}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden /> Leave lister area
          </button>
          <p className="px-2 text-xs text-muted-foreground">Lister workspace</p>
        </div>
      }
      headerExtra={
        <>
          <MobileListerChip />
          <div className="hidden md:block">
            <OrgSwitcher />
          </div>
        </>
      }
      dock={<ListerDock />}
    >
      {allowed ? children : <NoAccess />}
    </DashboardShell>
  )
}
