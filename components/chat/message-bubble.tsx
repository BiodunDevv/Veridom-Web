"use client"

import * as React from "react"
import {
  AlertTriangle,
  Check,
  CheckCheck,
  Clock3,
  Flag,
  RefreshCw,
  ShieldAlert,
  SmilePlus,
} from "lucide-react"

import { isSeen, timeLabel } from "@/components/chat/chat-utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { REACTIONS, type ChatMessage } from "@/lib/api/inquiries"
import { cn } from "@/lib/utils"

export function MessageBubble({
  message,
  mine,
  showTime,
  seen,
  isLastMine,
  onReact,
  onReport,
  onRetry,
  onOpenPhoto,
}: {
  message: ChatMessage
  mine: boolean
  showTime: boolean
  seen: boolean
  isLastMine: boolean
  onReact: (emoji: string | null) => void
  onReport?: () => void
  onRetry: () => void
  onOpenPhoto: (url: string) => void
}) {
  const [menu, setMenu] = React.useState(false)
  const photos = message.attachments ?? []
  const reactions = (message.reactions ?? []).filter((r) => r.count > 0)
  const mineReaction = reactions.find((r) => r.mine)?.emoji

  return (
    <div
      className={cn(
        "group/msg flex max-w-[86%] flex-col gap-1 sm:max-w-[72%]",
        mine ? "items-end self-end" : "items-start self-start"
      )}
    >
      <div
        className={cn(
          "flex items-end gap-1.5",
          mine ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug break-words whitespace-pre-wrap shadow-sm",
            mine
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-card ring-1 ring-border",
            message.failed &&
              "bg-destructive/10 text-foreground ring-1 ring-destructive/40",
            message.pending && "opacity-70"
          )}
        >
          {photos.length ? (
            <div
              className={cn(
                "grid gap-1.5",
                photos.length > 1 ? "grid-cols-2" : "grid-cols-1"
              )}
            >
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onOpenPhoto(p.url)}
                  className="overflow-hidden rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Open photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbUrl ?? p.url}
                    alt=""
                    loading="lazy"
                    className="max-h-56 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
          {message.body ? <span>{message.body}</span> : null}
        </div>

        {!message.pending && !message.failed ? (
          <Popover open={menu} onOpenChange={setMenu}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="React or report"
                className="mb-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity outline-none group-hover/msg:opacity-100 hover:bg-accent focus-visible:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-60"
              >
                <SmilePlus className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align={mine ? "end" : "start"}
              className="w-auto gap-1 p-1.5"
            >
              <div className="flex gap-0.5">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(mineReaction === emoji ? null : emoji)
                      setMenu(false)
                    }}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg text-lg transition-transform outline-none hover:scale-110 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50",
                      mineReaction === emoji && "bg-primary/10"
                    )}
                    aria-label={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {!mine && onReport ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="justify-start text-muted-foreground"
                  onClick={() => {
                    setMenu(false)
                    onReport()
                  }}
                >
                  <Flag /> Report this message
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      {reactions.length ? (
        <div className="flex flex-wrap gap-1">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() => onReact(r.mine ? null : r.emoji)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                r.mine && "border-primary/50 bg-primary/10"
              )}
            >
              <span>{r.emoji}</span>
              <span className="tabular-nums">{r.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {message.moderation === "MASKED" ? (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground italic">
          <ShieldAlert className="size-3" aria-hidden /> Contact details are
          shared after a viewing is confirmed.
        </p>
      ) : null}
      {message.moderation === "FLAGGED" ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-3" aria-hidden /> Pay only through
          Veridom.
        </p>
      ) : null}

      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        {message.failed ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-semibold text-destructive hover:underline"
          >
            <RefreshCw className="size-3" /> Not sent. Tap to retry
          </button>
        ) : (
          <>
            {showTime ? <span>{timeLabel(message.createdAt)}</span> : null}
            {mine && message.pending ? (
              <Clock3 className="size-3" aria-label="Sending" />
            ) : null}
            {mine && !message.pending && isLastMine ? (
              seen ? (
                <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                  <CheckCheck className="size-3.5" aria-hidden /> Seen
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5">
                  <Check className="size-3.5" aria-hidden /> Sent
                </span>
              )
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export { isSeen }
