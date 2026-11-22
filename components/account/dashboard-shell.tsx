"use client"

import { usePathname } from "next/navigation"

import { AppHeader } from "@/components/account/account-header"
import { AppSidebar } from "@/components/account/account-sidebar"
import type { SidebarNavGroup } from "@/components/account/account-nav"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardShell({
  groups,
  href,
  label,
  footer,
  headerExtra,
  dock,
  children,
}: {
  groups: SidebarNavGroup[]
  href: string
  label: string
  footer?: React.ReactNode
  headerExtra?: React.ReactNode
  dock?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar
        pathname={pathname}
        groups={groups}
        href={href}
        label={label}
        footer={footer}
      />
      <SidebarInset className="min-w-0">
        <AppHeader pathname={pathname} groups={groups} extra={headerExtra} />
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pb-28 md:p-6 md:pb-6 [&>*]:shrink-0">
          {children}
        </div>
        {dock}
      </SidebarInset>
    </SidebarProvider>
  )
}
