"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useChatUnread } from "@/features/chat/hooks"
import type { ChatSide } from "@/lib/api/inquiries"
import { cn } from "@/lib/utils"

/** A header shortcut to Messages with an unread badge. */
export function MessagesButton({
  side,
  className,
}: {
  side: ChatSide
  className?: string
}) {
  const unread = useChatUnread(side, true).data ?? 0
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative size-8 shrink-0 lg:size-9", className)}
    >
      <Link
        href={side === "lister" ? "/lister/inquiries" : "/account/messages"}
        aria-label={unread ? `Messages, ${unread} unread` : "Messages"}
      >
        <MessageSquare className="size-[18px]" />
        {unread ? (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground tabular-nums ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}
