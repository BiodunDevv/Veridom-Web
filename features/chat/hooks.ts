"use client"

import * as React from "react"
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { INQUIRY_HINT } from "@/features/realtime/hooks"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  inquiriesApi,
  type ChatMessage,
  type ChatSide,
  type ThreadInfo,
} from "@/lib/api/inquiries"

export const chatKeys = {
  inbox: (side: ChatSide, assignedToMe = false) =>
    ["chat", "inbox", side, assignedToMe] as const,
  unread: (side: ChatSide) => ["chat", "unread", side] as const,
}

/** The thread list. Refreshes every 15 seconds so unread badges stay honest. */
export const useInbox = (side: ChatSide, assignedToMe = false) =>
  useInfiniteQuery({
    queryKey: chatKeys.inbox(side, assignedToMe),
    queryFn: ({ pageParam }) =>
      inquiriesApi.inbox(side, {
        before: pageParam || undefined,
        assignedToMe,
      }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextBefore ?? undefined,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })

export const useChatUnread = (side: ChatSide, enabled = true) =>
  useQuery({
    queryKey: chatKeys.unread(side),
    queryFn: () => inquiriesApi.unread(side),
    enabled,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
  })

/** Message ids are numeric strings: compare them as numbers, never as text. */
const num = (id: string) => {
  try {
    return BigInt(id)
  } catch {
    return BigInt(0)
  }
}

export function mergeMessages(
  prev: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const map = new Map<string, ChatMessage>()
  for (const m of prev) map.set(m.id, m)
  for (const m of incoming) {
    // A server copy replaces the optimistic one with the same client id.
    const clash = [...map.values()].find(
      (x) =>
        x.pending &&
        x.clientMessageId &&
        x.clientMessageId === m.clientMessageId
    )
    if (clash) map.delete(clash.id)
    map.set(m.id, { ...map.get(m.id), ...m })
  }
  return [...map.values()].sort((a, b) => {
    // Local, unsent messages stay at the end.
    if (a.pending && !b.pending) return 1
    if (!a.pending && b.pending) return -1
    if (a.pending && b.pending) return a.createdAt.localeCompare(b.createdAt)
    const d = num(a.id) - num(b.id)
    return d < BigInt(0) ? -1 : d > BigInt(0) ? 1 : 0
  })
}

const POLL_MS = 5_000
const TYPING_EVERY_MS = 3_000

/**
 * One conversation: loads the latest page, polls for new messages and
 * reactions every 5 seconds (works with or without a socket), and sends
 * messages optimistically with a client id so a retry never posts twice.
 */
export function useChatThread(side: ChatSide, id: string) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [info, setInfo] = React.useState<ThreadInfo | null>(null)
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading"
  )
  const [olderCursor, setOlderCursor] = React.useState<string | null>(null)
  const [loadingOlder, setLoadingOlder] = React.useState(false)
  const messagesRef = React.useRef<ChatMessage[]>([])
  const reactionsSince = React.useRef<string | undefined>(undefined)
  const lastTyping = React.useRef(0)
  const lastRead = React.useRef("")

  const apply = React.useCallback((next: ChatMessage[]) => {
    messagesRef.current = next
    setMessages(next)
  }, [])

  const markRead = React.useCallback(
    (page: ChatMessage[]) => {
      const newest = page.filter((m) => !m.pending).at(-1)
      if (!newest || document.hidden || newest.id === lastRead.current) return
      if (
        page.every(
          (m) => m.side === (side === "lister" ? "LISTER" : "CUSTOMER")
        )
      )
        return
      lastRead.current = newest.id
      void inquiriesApi
        .read(side, id)
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ["chat", "unread"] })
          void queryClient.invalidateQueries({ queryKey: ["chat", "inbox"] })
        })
        .catch(() => undefined)
    },
    [id, queryClient, side]
  )

  // First page.
  React.useEffect(() => {
    let alive = true
    inquiriesApi
      .messages(side, id)
      .then((page) => {
        if (!alive) return
        apply(mergeMessages([], page.items))
        setInfo(page.inquiry)
        setOlderCursor(page.nextBefore ?? null)
        setStatus("ready")
        markRead(page.items)
      })
      .catch(() => alive && setStatus("error"))
    return () => {
      alive = false
    }
  }, [apply, id, markRead, side])

  // Poll for what's new.
  React.useEffect(() => {
    if (status !== "ready") return
    let busy = false
    const tick = async () => {
      if (document.hidden || busy) return
      busy = true
      try {
        const current = messagesRef.current.filter((m) => !m.pending)
        const lastId = current.at(-1)?.id
        const page = await inquiriesApi.messages(side, id, {
          after: lastId,
          limit: 50,
        })
        setInfo(page.inquiry)
        if (page.items.length) {
          apply(mergeMessages(messagesRef.current, page.items))
          markRead(page.items)
        }
        const changes = await inquiriesApi.reactions(
          side,
          id,
          reactionsSince.current
        )
        reactionsSince.current = changes.serverTime
        if (changes.items.length) {
          const byId = new Map(
            changes.items.map((c) => [c.messageId, c.reactions])
          )
          apply(
            messagesRef.current.map((m) =>
              byId.has(m.id) ? { ...m, reactions: byId.get(m.id) } : m
            )
          )
        }
      } catch {
        // Offline or the server is waking up: try again next tick.
      } finally {
        busy = false
      }
    }
    const timer = window.setInterval(tick, POLL_MS)
    const onVisible = () => !document.hidden && void tick()
    const onHint = (event: Event) => {
      const target = (event as CustomEvent<string | undefined>).detail
      if (!target || target === id) void tick()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener(INQUIRY_HINT, onHint)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener(INQUIRY_HINT, onHint)
    }
  }, [apply, id, markRead, side, status])

  const loadOlder = React.useCallback(async () => {
    if (!olderCursor || loadingOlder) return
    setLoadingOlder(true)
    try {
      const page = await inquiriesApi.messages(side, id, {
        before: olderCursor,
      })
      apply(mergeMessages(messagesRef.current, page.items))
      setOlderCursor(page.nextBefore ?? null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't load earlier messages."))
    } finally {
      setLoadingOlder(false)
    }
  }, [apply, id, loadingOlder, olderCursor, side])

  const sendMessage = React.useCallback(
    async (
      body: string,
      attachments: { id: string; thumbUrl?: string; url: string }[] = [],
      retryOf?: ChatMessage
    ) => {
      const clientMessageId = retryOf?.clientMessageId ?? crypto.randomUUID()
      const temp: ChatMessage = {
        id: `local-${clientMessageId}`,
        side: side === "lister" ? "LISTER" : "CUSTOMER",
        kind: "TEXT",
        body,
        createdAt: new Date().toISOString(),
        pending: true,
        clientMessageId,
        attachments: attachments.map((a) => ({ ...a })),
      }
      apply(
        mergeMessages(
          messagesRef.current.filter(
            (m) => m.clientMessageId !== clientMessageId
          ),
          [temp]
        )
      )
      try {
        const sent = await inquiriesApi.send(side, id, {
          body,
          clientMessageId,
          attachmentIds: attachments.map((a) => a.id),
        })
        apply(
          mergeMessages(
            messagesRef.current.filter(
              (m) => m.clientMessageId !== clientMessageId
            ),
            [{ ...sent, clientMessageId: undefined }]
          )
        )
        void queryClient.invalidateQueries({ queryKey: ["chat", "inbox"] })
        return true
      } catch (error) {
        apply(
          messagesRef.current.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...m, pending: false, failed: true }
              : m
          )
        )
        toast.error(getApiErrorMessage(error, "That message didn't send."))
        return false
      }
    },
    [apply, id, queryClient, side]
  )

  const react = React.useCallback(
    async (messageId: string, emoji: string | null) => {
      try {
        const { reactions } = await inquiriesApi.react(side, messageId, emoji)
        apply(
          messagesRef.current.map((m) =>
            m.id === messageId ? { ...m, reactions } : m
          )
        )
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Couldn't react."))
      }
    },
    [apply, side]
  )

  const notifyTyping = React.useCallback(() => {
    const now = Date.now()
    if (now - lastTyping.current < TYPING_EVERY_MS) return
    lastTyping.current = now
    void inquiriesApi.typing(side, id).catch(() => undefined)
  }, [id, side])

  return {
    messages,
    info,
    status,
    hasOlder: Boolean(olderCursor),
    loadingOlder,
    loadOlder,
    sendMessage,
    react,
    notifyTyping,
    setInfo,
  }
}
