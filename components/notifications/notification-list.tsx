"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCheck, Loader2, Settings2 } from "lucide-react"

import { timeAgo } from "@/components/lister/lister-ui"
import { metaFor, safeLink } from "@/components/notifications/notification-meta"
import { Button } from "@/components/ui/button"
import { Illustration } from "@/components/ui/illustration"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks"
import type { AppNotification } from "@/lib/api/notifications"
import { cn } from "@/lib/utils"

function Row({
  item,
  onOpen,
}: {
  item: AppNotification
  onOpen: (item: AppNotification) => void
}) {
  const meta = metaFor(item.type)
  const Icon = meta.icon
  const unread = !item.readAt
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          unread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent"
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            meta.tone
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-sm leading-snug",
              unread ? "font-semibold" : "font-medium text-foreground/80"
            )}
          >
            {item.title}
          </span>
          {item.body ? (
            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
              {item.body}
            </span>
          ) : null}
          <span className="mt-1 block text-[11px] text-muted-foreground">
            {timeAgo(item.createdAt)}
          </span>
        </span>
        {unread ? (
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
            aria-label="Unread"
          />
        ) : null}
      </button>
    </li>
  )
}

/** The list inside the bell popover, the phone sheet and the full page. */
export function NotificationList({
  onNavigate,
  showSettingsLink = true,
  className,
}: {
  onNavigate?: () => void
  showSettingsLink?: boolean
  className?: string
}) {
  const router = useRouter()
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const unread = useUnreadCount(true).data ?? 0
  const query = useNotifications(true, unreadOnly)
  const markRead = useMarkRead()
  const items = React.useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data]
  )

  const open = (item: AppNotification) => {
    if (!item.readAt) markRead.mutate({ ids: [item.id] })
    const link = safeLink(item.link)
    if (link) {
      onNavigate?.()
      router.push(link)
    }
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <div
          role="tablist"
          aria-label="Filter"
          className="inline-flex rounded-full border bg-muted/40 p-0.5 text-xs font-semibold"
        >
          {(
            [
              [false, "All"],
              [true, `Unread${unread ? ` ${unread}` : ""}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              role="tab"
              aria-selected={unreadOnly === value}
              onClick={() => setUnreadOnly(value)}
              className={cn(
                "rounded-full px-3 py-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                unreadOnly === value
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="xs"
            variant="ghost"
            disabled={!unread || markRead.isPending}
            onClick={() => markRead.mutate({ all: true })}
          >
            <CheckCheck /> Mark all read
          </Button>
          {showSettingsLink ? (
            <Button asChild size="icon-xs" variant="ghost">
              <Link
                href="/account/notifications"
                aria-label="Notification settings"
                onClick={onNavigate}
              >
                <Settings2 />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isLoading ? (
          <ul className="flex flex-col gap-1" aria-busy>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3 px-3 py-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2 opacity-60" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Illustration name="notifications" size="sm" className="mb-1" />
            <p className="font-semibold">
              {unreadOnly ? "You're all caught up" : "Nothing yet"}
            </p>
            <p className="max-w-[16rem] text-xs text-muted-foreground">
              Payments, viewings and messages will show up here as they happen.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <Row key={item.id} item={item} onOpen={open} />
              ))}
            </ul>
            {query.hasNextPage ? (
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={query.isFetchingNextPage}
                  onClick={() => void query.fetchNextPage()}
                >
                  {query.isFetchingNextPage ? (
                    <Loader2 className="animate-spin" />
                  ) : null}
                  Show older
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
