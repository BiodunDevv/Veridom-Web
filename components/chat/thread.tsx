"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowDown,
  ArrowLeft,
  Ban,
  Building2,
  Check,
  Loader2,
  Lock,
  MoreVertical,
  UserCheck,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import {
  basePathFor,
  dayLabel,
  isSeen,
  mySide,
  sameDay,
} from "@/components/chat/chat-utils"
import { Composer } from "@/components/chat/composer"
import { ListingPreview } from "@/components/chat/listing-preview"
import { MessageBubble } from "@/components/chat/message-bubble"
import { SystemCardView } from "@/components/chat/system-card"
import { useConfirm } from "@/components/lister/confirm-dialog"
import { initialsOf } from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useMe } from "@/features/auth/hooks"
import { useChatThread } from "@/features/chat/hooks"
import { useMembers, usePermissions } from "@/features/lister/org-hooks"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  inquiriesApi,
  type ChatMessage,
  type ChatSide,
} from "@/lib/api/inquiries"
import { cn } from "@/lib/utils"

function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setReason("")
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Report this message</DialogTitle>
          <DialogDescription>
            Tell the Veridom team what&apos;s wrong. They&apos;ll look at it.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          maxLength={300}
          placeholder="What happened?"
          aria-label="Reason"
        />
        <DialogFooter>
          <Button
            disabled={reason.trim().length < 3 || busy}
            onClick={async () => {
              setBusy(true)
              await onSubmit(reason.trim()).finally(() => setBusy(false))
              onOpenChange(false)
            }}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** One conversation, full screen on phones and a card beside the inbox on desktop. */
export function ChatThread({ side, id }: { side: ChatSide; id: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const chat = useChatThread(side, id)
  const myId = useMe().data?._id
  const confirm = useConfirm()
  const scroller = React.useRef<HTMLDivElement>(null)
  const stick = React.useRef(true)
  const prevHeight = React.useRef(0)
  const [showJump, setShowJump] = React.useState(false)
  const [photo, setPhoto] = React.useState<string | null>(null)
  const [reporting, setReporting] = React.useState<string | null>(null)
  const members = useMembers(
    side === "lister" && can("member:manage", "member:invite")
  ).data
  const { messages, info } = chat
  const me = mySide(side)

  const customerName =
    messages.find((m) => m.side === "CUSTOMER")?.senderFirstName ?? "Customer"
  const title =
    side === "lister" ? customerName : (info?.listingTitle ?? "Conversation")
  const subtitle =
    side === "lister" ? info?.listingTitle : "Message to the lister"

  const nearBottom = () => {
    const el = scroller.current
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 140
  }

  // Stay at the bottom for new messages, unless the reader scrolled up.
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    if (prevHeight.current && !stick.current && el.scrollTop < 40) {
      // Older messages were added above: keep the reader where they were.
      el.scrollTop += el.scrollHeight - prevHeight.current
    } else if (stick.current) {
      el.scrollTop = el.scrollHeight
    } else {
      setShowJump(true)
    }
    prevHeight.current = el.scrollHeight
  }, [messages])

  const lastMineId = [...messages]
    .reverse()
    .find((m) => m.side === me && !m.pending)?.id
  const readOnly = info?.status === "LOST"

  async function act(label: string, run: () => Promise<unknown>) {
    try {
      await run()
      void queryClient.invalidateQueries({ queryKey: ["chat"] })
      toast.success(label)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "That didn't work."))
      throw error
    }
  }

  const grouped = messages.map((m, i) => {
    const prev = messages[i - 1]
    const next = messages[i + 1]
    return {
      m,
      newDay: !prev || !sameDay(prev.createdAt, m.createdAt),
      showTime:
        !next ||
        next.side !== m.side ||
        !sameDay(next.createdAt, m.createdAt) ||
        new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime() >
          5 * 60_000,
    }
  })

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col bg-background lg:static lg:z-auto lg:h-(--chat-h) lg:min-h-[26rem] lg:overflow-hidden lg:rounded-2xl lg:border lg:bg-card lg:shadow-md">
      <header className="flex items-center gap-2 border-b bg-background/95 px-2 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur sm:px-4 lg:pt-2.5">
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="shrink-0 lg:hidden"
          aria-label="Back to messages"
        >
          <Link href={basePathFor(side)}>
            <ArrowLeft />
          </Link>
        </Button>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15">
          {side === "lister" ? (
            initialsOf(customerName)
          ) : (
            <Building2 className="size-[18px]" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {info ? title : <Skeleton className="h-4 w-40" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {info?.otherTyping ? (
              <span className="font-medium text-primary">
                {info.otherTypingName ?? "They"} is typing…
              </span>
            ) : info?.listingId ? (
              <Link
                href={`/properties/${info.listingId}`}
                className="hover:underline"
              >
                {subtitle}
              </Link>
            ) : (
              subtitle
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Conversation options"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {info?.listingId ? (
              <DropdownMenuItem asChild>
                <Link href={`/properties/${info.listingId}`}>
                  <Building2 /> View the property
                </Link>
              </DropdownMenuItem>
            ) : null}
            {side === "lister" && members?.length ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
                  <UserCheck className="size-3.5" aria-hidden /> Assign to
                </DropdownMenuLabel>
                {[...members]
                  .filter((mem) => mem.status === "ACTIVE")
                  .sort(
                    (a, b) =>
                      Number(b.userId === myId) - Number(a.userId === myId)
                  )
                  .map((mem) => {
                    const current = info?.assignedTo === mem.userId
                    return (
                      <DropdownMenuItem
                        key={mem.id}
                        disabled={current}
                        onSelect={() =>
                          void act(`Assigned to ${mem.firstName}`, () =>
                            inquiriesApi.assign(id, mem.userId)
                          ).catch(() => undefined)
                        }
                        className="gap-2.5"
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {initialsOf(`${mem.firstName} ${mem.lastName}`)}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {mem.firstName} {mem.lastName}
                          {mem.userId === myId ? (
                            <span className="text-muted-foreground">
                              {" "}
                              (you)
                            </span>
                          ) : null}
                        </span>
                        {current ? (
                          <Check className="size-4 text-primary" />
                        ) : null}
                      </DropdownMenuItem>
                    )
                  })}
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                confirm.ask({
                  title: "Close this conversation?",
                  description:
                    "It moves out of the way. A new message can bring it back.",
                  confirmLabel: "Close",
                  run: () =>
                    act("Conversation closed", () =>
                      inquiriesApi.close(side, id)
                    ).then(() => router.push(basePathFor(side))),
                })
              }
            >
              <XCircle /> Close conversation
            </DropdownMenuItem>
            {side === "lister" && info?.customerId ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() =>
                  confirm.ask({
                    title: `Block ${customerName}?`,
                    description:
                      "They won't be able to message anyone in this lister. You can unblock them later.",
                    confirmLabel: "Block customer",
                    tone: "danger",
                    run: () =>
                      act("Customer blocked", () =>
                        inquiriesApi.block(info.customerId!)
                      ),
                  })
                }
              >
                <Ban /> Block customer
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ListingPreview listingId={info?.listingId} title={info?.listingTitle} />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scroller}
          onScroll={() => {
            stick.current = nearBottom()
            if (stick.current) setShowJump(false)
          }}
          className="flex h-full flex-col gap-2.5 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-5"
        >
          {chat.status === "loading" ? (
            <div className="flex flex-col gap-3" aria-busy>
              {[60, 40, 70, 35].map((w, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "h-12 rounded-2xl",
                    i % 2 ? "self-end" : "self-start"
                  )}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : chat.status === "error" ? (
            <RetryState
              label="this conversation"
              onRetry={() => window.location.reload()}
            />
          ) : (
            <>
              {chat.hasOlder ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="self-center text-muted-foreground"
                  disabled={chat.loadingOlder}
                  onClick={() => {
                    stick.current = false
                    prevHeight.current = scroller.current?.scrollHeight ?? 0
                    void chat.loadOlder()
                  }}
                >
                  {chat.loadingOlder ? (
                    <Loader2 className="animate-spin" />
                  ) : null}
                  Earlier messages
                </Button>
              ) : null}
              {grouped.length === 0 ? (
                <p className="m-auto max-w-xs text-center text-sm text-muted-foreground">
                  No messages yet. Say hello below.
                </p>
              ) : null}
              {grouped.map(({ m, newDay, showTime }) => (
                <React.Fragment key={m.id}>
                  {newDay ? (
                    <p className="my-1 self-center rounded-full bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
                      {dayLabel(m.createdAt)}
                    </p>
                  ) : null}
                  {m.kind === "SYSTEM_CARD" && m.card ? (
                    <SystemCardView card={m.card} side={side} />
                  ) : (
                    <MessageBubble
                      message={m}
                      mine={m.side === me}
                      showTime={showTime}
                      isLastMine={m.id === lastMineId}
                      seen={isSeen(m, info?.otherLastReadId)}
                      onReact={(emoji) => void chat.react(m.id, emoji)}
                      onReport={() => setReporting(m.id)}
                      onRetry={() =>
                        void chat.sendMessage(
                          m.body ?? "",
                          (m.attachments ?? []).map((a) => ({
                            id: a.id,
                            url: a.url,
                            thumbUrl: a.thumbUrl,
                          })),
                          m as ChatMessage
                        )
                      }
                      onOpenPhoto={setPhoto}
                    />
                  )}
                </React.Fragment>
              ))}
              {info?.otherTyping ? (
                <div
                  className="flex w-fit items-center gap-1 self-start rounded-2xl rounded-bl-md bg-card px-4 py-3 ring-1 ring-border"
                  aria-label="Typing"
                >
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
        {showJump ? (
          <Button
            size="sm"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
            onClick={() => {
              const el = scroller.current
              if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
              setShowJump(false)
            }}
          >
            <ArrowDown /> New messages
          </Button>
        ) : null}
      </div>

      {readOnly ? (
        <div className="flex items-center justify-center gap-2 border-t bg-muted/40 px-4 py-4 text-center text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" aria-hidden />
          This property was taken, so the conversation is read only.
        </div>
      ) : (
        <>
          {info?.status === "CLOSED" ? (
            <p className="border-t bg-muted/30 px-4 py-1.5 text-center text-xs text-muted-foreground">
              This conversation was closed. Sending a message may reopen it.
            </p>
          ) : null}
          <Composer
            side={side}
            threadId={id}
            disabled={chat.status !== "ready"}
            onSend={(body, atts) => chat.sendMessage(body, atts)}
            onTyping={chat.notifyTyping}
          />
        </>
      )}

      <Dialog open={Boolean(photo)} onOpenChange={(o) => !o && setPhoto(null)}>
        <DialogContent className="max-w-3xl border-0 bg-black/90 p-2 text-white sm:max-w-3xl">
          <DialogTitle className="sr-only">Photo</DialogTitle>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              className="max-h-[80svh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ReportDialog
        open={Boolean(reporting)}
        onOpenChange={(o) => !o && setReporting(null)}
        onSubmit={(reason) =>
          act("Report sent. Thank you.", () =>
            inquiriesApi.report(side, reporting!, reason)
          ).catch(() => undefined)
        }
      />
      {confirm.dialog}
    </div>
  )
}
