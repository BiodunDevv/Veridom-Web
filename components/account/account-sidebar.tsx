import Link from "next/link"

import { LogoIcon } from "@/components/logo"
import { NavGroup } from "@/components/account/nav-group"
import type { SidebarNavGroup } from "@/components/account/account-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function AppSidebar({
  pathname,
  groups,
  href,
  label,
  footer,
}: {
  pathname: string
  groups: SidebarNavGroup[]
  href: string
  label: string
  footer?: React.ReactNode
}) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild size="lg">
          <Link href={href}>
            <LogoIcon />
            <span className="font-semibold tracking-tight">{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group, index) => (
          <NavGroup
            key={group.label ?? `group-${index}`}
            {...group}
            pathname={pathname}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
    </Sidebar>
  )
}
