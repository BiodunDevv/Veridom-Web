"use client"

import { AppBreadcrumbs } from "@/components/account/account-breadcrumbs"
import {
  isActivePath,
  type SidebarNavGroup,
} from "@/components/account/account-nav"
import { CustomSidebarTrigger } from "@/components/account/sidebar-trigger"
import { MessagesButton } from "@/components/chat/messages-button"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { NavUser } from "@/components/account/nav-user"
import { usePermissions } from "@/features/lister/org-hooks"
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
  const { can } = usePermissions()
  const canChat = can(
    "inquiry:read:any",
    "inquiry:read:assigned",
    "inquiry:respond"
  )
  const activeItem = groups
    .flatMap((group) => group.items)
    .find((item) => isActivePath(item, pathname))

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <CustomSidebarTrigger />
        <Separator
          className="mr-2 h-4 data-[orientation=vertical]:self-center"
          orientation="vertical"
        />
        <div className="hidden whitespace-nowrap min-[460px]:block">
          <AppBreadcrumbs
            page={
              activeItem
                ? { title: activeItem.title, icon: activeItem.icon }
                : null
            }
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {extra}
        {canChat ? <MessagesButton side="lister" /> : null}
        <NotificationBell />
        <ThemeToggleButton className="hidden size-8 sm:inline-flex" />
        <Separator
          className="hidden h-4 data-[orientation=vertical]:self-center sm:block"
          orientation="vertical"
        />
        <NavUser />
      </div>
    </header>
  )
}
