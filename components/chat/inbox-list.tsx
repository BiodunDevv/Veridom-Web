"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Loader2, MessageSquareText, UserCheck } from "lucide-react"

import { basePathFor, inboxTime } from "@/components/chat/chat-utils"
import { initialsOf } from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useInbox } from "@/features/chat/hooks"
import type { ChatSide, InboxItem } from "@/lib/api/inquiries"
import { cn } from "@/lib/utils"

const unreadCount = (item: InboxItem) =>
  typeof item.unread === "number" ? item.unread : item.unread ? 1 : 0

function Row({
  item,
  side,
  active,
  index,
}: {
  item: InboxItem
  side: ChatSide
  active: boolean
  index: number
}) {
  const unread = unreadCount(item)
  const name =
    side === "lister"
      ? (item.customerFirstName ?? "Customer")
      : (item.listingTitle ?? "Conversation")
  const preview =
    item.lastMessageSide === "SYSTEM"
      ? "Update"
      : `${
          item.lastMessageSide === (side === "lister" ? "LISTER" : "CUSTOMER")
            ? "You: "
            : ""
        }${item.lastMessagePreview ?? "No messages yet"}`

  return (
    <li
      className="animate-in fade-in slide-in-from-bottom-1"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <Link
        href={`${basePathFor(side)}/${item.id}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]",
          active
            ? "bg-primary/10"
            : unread
              ? "bg-primary/[0.04] hover:bg-accent"
              : "hover:bg-accent"
        )}
      >
        <span
          className={cn(
            "relative grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15",
            unread > 0 && "ring-2 ring-primary"
          )}
        >
          {side === "lister" ? (
            initialsOf(name)
          ) : (
            <Building2 className="size-5" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                unread ? "font-semibold" : "font-medium"
              )}
            >
              {name}
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {inboxTime(item.lastMessageAt)}
            </span>
          </span>
          {side === "lister" &&
          (item.listingTitle || item.assignedFirstName) ? (
            <span className="mt-0.5 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                <Building2 className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{item.listingTitle}</span>
              </span>
              {item.assignedFirstName ? (
                <span
                  title={`Assigned to ${item.assignedFirstName}`}
                  className="inline-flex max-w-[45%] shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  <UserCheck className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{item.assignedFirstName}</span>
                </span>
              ) : null}
            </span>
          ) : null}
          <span className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-xs",
                unread ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {preview}
            </span>
            {unread ? (
              <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[11px] leading-5 font-semibold text-primary-foreground tabular-nums">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </span>
        </span>
      </Link>
    </li>
  )
}

export function InboxList({ side }: { side: ChatSide }) {
  const pathname = usePathname()
  const [filter, setFilter] = React.useState<"all" | "unread" | "mine">("all")
  const query = useInbox(side, filter === "mine")
  const all = React.useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data]
  )
  const items =
    filter === "unread" ? all.filter((i) => unreadCount(i) > 0) : all
  const tabs: [typeof filter, string][] = [
    ["all", "All"],
    ["unread", "Unread"],
    ...(side === "lister"
      ? ([["mine", "Mine"]] as [typeof filter, string][])
      : []),
  ]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-2 pb-3">
        <div
          role="tablist"
          aria-label="Filter conversations"
          className="inline-flex rounded-full border bg-muted/40 p-0.5 text-xs font-semibold"
        >
          {tabs.map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                filter === value
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isLoading ? (
          <ul className="flex flex-col gap-1" aria-busy>
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-3/4 opacity-60" />
                </div>
              </li>
            ))}
          </ul>
        ) : query.isError ? (
          <RetryState label="your messages" onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <MessageSquareText className="size-5" aria-hidden />
            </span>
            <p className="font-semibold">
              {filter === "unread"
                ? "No unread messages"
                : "No conversations yet"}
            </p>
            <p className="max-w-[16rem] text-xs text-muted-foreground">
              {side === "lister"
                ? "When a customer messages about one of your listings, it appears here."
                : "Open a property and tap Message to start a conversation with the lister."}
            </p>
            {side === "customer" ? (
              <Button asChild size="sm" className="mt-2">
                <Link href="/properties">Browse properties</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <Row
                  key={item.id}
                  index={items.indexOf(item)}
                  item={item}
                  side={side}
                  active={pathname === `${basePathFor(side)}/${item.id}`}
                />
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
