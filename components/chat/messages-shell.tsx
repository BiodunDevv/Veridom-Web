"use client"

import { usePathname } from "next/navigation"

import { basePathFor } from "@/components/chat/chat-utils"
import { InboxList } from "@/components/chat/inbox-list"
import type { ChatSide } from "@/lib/api/inquiries"
import { cn } from "@/lib/utils"

/**
 * Inbox on the left and the open conversation on the right. On phones it shows
 * one at a time: the inbox, or the conversation full screen.
 */
export function MessagesShell({
  side,
  children,
}: {
  side: ChatSide
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const atInbox = pathname === basePathFor(side)

  return (
    <div
      className="flex flex-col gap-4"
      style={
        {
          "--chat-h":
            side === "lister" ? "calc(100svh - 11rem)" : "calc(100svh - 15rem)",
        } as React.CSSProperties
      }
    >
      <div className={cn(atInbox ? "block" : "hidden lg:block")}>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {side === "lister"
            ? "Conversations with customers about your listings."
            : "Your conversations with listers."}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section
          aria-label="Conversations"
          className={cn(
            "rounded-2xl bg-card p-2 shadow-md lg:block lg:h-(--chat-h) lg:min-h-[26rem] lg:overflow-hidden",
            atInbox ? "block min-h-[60svh]" : "hidden"
          )}
        >
          <InboxList side={side} />
        </section>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
