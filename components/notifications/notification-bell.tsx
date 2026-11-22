"use client"

import * as React from "react"
import { Bell } from "lucide-react"

import { NotificationList } from "@/components/notifications/notification-list"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUnreadCount } from "@/features/notifications/hooks"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/** The bell with an unread badge: a popover on desktop, a bottom sheet on phones. */
export function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const unread = useUnreadCount(true).data ?? 0
  const previous = React.useRef(unread)
  const [ring, setRing] = React.useState(0)

  // A gentle wiggle when something new arrives.
  React.useEffect(() => {
    if (unread > previous.current) setRing((n) => n + 1)
    previous.current = unread
  }, [unread])

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      className={cn("relative size-8 shrink-0 lg:size-9", className)}
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      <Bell
        key={ring}
        className={cn("size-[18px]", ring > 0 && "animate-bell-ring")}
      />
      {unread ? (
        <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground tabular-nums ring-2 ring-background">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Button>
  )

  if (isMobile)
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[88svh] pb-[env(safe-area-inset-bottom)]">
            <DrawerHeader>
              <DrawerTitle className="text-lg">Notifications</DrawerTitle>
              <DrawerDescription>
                What&apos;s happened lately.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col px-2 pb-4">
              <NotificationList onNavigate={() => setOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="max-h-[min(36rem,80svh)] w-[26rem] max-w-[calc(100vw-1.5rem)] gap-0 p-3"
      >
        <NotificationList onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
