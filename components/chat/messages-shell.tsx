"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BellDot, CircleDot, MessageSquare, Reply } from "lucide-react"

import { basePathFor } from "@/components/chat/chat-utils"
import { InboxList } from "@/components/chat/inbox-list"
import { ListerHero } from "@/components/lister/lister-ui"
import { useChatUnread, useInbox } from "@/features/chat/hooks"
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
  const inbox = useInbox(side)
  const unread = useChatUnread(side, true).data ?? 0
  const items = React.useMemo(
    () => inbox.data?.pages.flatMap((p) => p.items) ?? [],
    [inbox.data]
  )
  // A reply is owed when the other side spoke last in a live conversation.
  const theirs = side === "lister" ? "CUSTOMER" : "LISTER"
  const needsReply = items.filter(
    (i) => i.status === "OPEN" && i.lastMessageSide === theirs
  ).length
  const open = items.filter((i) => i.status === "OPEN").length

  return (
    <div
      className="flex flex-col gap-4"
      style={
        {
          "--chat-h":
            side === "lister" ? "calc(100svh - 14rem)" : "calc(100svh - 18rem)",
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "lg:[&_dl]:hidden",
          atInbox ? "block" : "hidden lg:block"
        )}
      >
        <ListerHero
          icon={MessageSquare}
          eyebrow="Inbox"
          title="Messages"
          description={
            side === "lister"
              ? "Conversations with customers about your listings."
              : "Your conversations with listers."
          }
          loading={inbox.isLoading}
          stats={[
            {
              label: "Conversations",
              value: items.length,
              icon: MessageSquare,
            },
            {
              label: "Unread",
              value: unread,
              icon: BellDot,
              tone: unread ? "warn" : "default",
              hint: unread ? "Waiting for you" : "All caught up",
            },
            {
              label: "Needs reply",
              value: needsReply,
              icon: Reply,
              tone: needsReply ? "warn" : "default",
              hint: needsReply ? "They spoke last" : "Nothing owed",
            },
            {
              label: "Open",
              value: open,
              icon: CircleDot,
              tone: "good",
            },
          ]}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section
          aria-label="Conversations"
          className={cn(
            "rounded-2xl bg-card p-2 shadow-md lg:block lg:h-(--chat-h) lg:min-h-[26rem] lg:overflow-hidden",
            atInbox ? "block min-h-[50svh]" : "hidden"
          )}
        >
          <InboxList side={side} />
        </section>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
