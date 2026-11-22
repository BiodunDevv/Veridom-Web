"use client"

import { AppBreadcrumbs } from "@/components/account/account-breadcrumbs"
import {
  isActivePath,
  type SidebarNavGroup,
} from "@/components/account/account-nav"
import { CustomSidebarTrigger } from "@/components/account/sidebar-trigger"
import { NavUser } from "@/components/account/nav-user"
import { ThemeToggleButton } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"

export function AppHeader({
  pathname,
  groups,
  extra,
}: {
  pathname: string
  groups: SidebarNavGroup[]
  extra?: React.ReactNode
}) {
  const activeItem = groups
    .flatMap((group) => group.items)
    .find((item) => isActivePath(item, pathname))

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <AppBreadcrumbs
          page={
            activeItem
              ? { title: activeItem.title, icon: activeItem.icon }
              : null
          }
        />
      </div>
      <div className="flex items-center gap-3">
        {extra}
        <ThemeToggleButton className="size-8" />
        <Separator
          className="h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <NavUser />
      </div>
    </header>
  )
}
