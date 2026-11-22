import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"

/** Customers use `/…`, listers use `/lister/…`. Same shapes on both sides. */
export type ChatSide = "customer" | "lister"

export type ThreadStatus = "OPEN" | "CLOSED" | "EXPIRED" | "CONVERTED" | "LOST"

export type InboxItem = {
  id: string
  status: ThreadStatus
  listingId?: string
  listingTitle?: string
  lastMessageAt?: string | null
  lastMessagePreview?: string | null
  lastMessageSide?: "CUSTOMER" | "LISTER" | "SYSTEM" | null
  unread?: number | boolean
  customerFirstName?: string
  customerId?: string
  assignedFirstName?: string | null
}

export type InboxPage = { items: InboxItem[]; nextBefore: string | null }

export type MessageSide = "CUSTOMER" | "LISTER" | "SYSTEM"

export type SystemCard = {
  type:
    | "VIEWING_REQUESTED"
    | "VIEWING_CONFIRMED"
    | "VIEWING_DECLINED"
    | "VIEWING_CANCELLED"
    | "RESERVATION_HELD"
    | "PAYMENT_RECEIVED"
    | "PROPERTY_TAKEN"
  inspectionId?: string
  dealId?: string
  [key: string]: unknown
}

export type Attachment = {
  id: string
  url: string
  thumbUrl?: string
  width?: number
  height?: number
}

export type Reaction = { emoji: string; count: number; mine: boolean }

export type ChatMessage = {
  /** A numeric string. */
  id: string
  side: MessageSide
  kind: "TEXT" | "SYSTEM_CARD"
  body?: string | null
  card?: SystemCard | null
  moderation?: "OK" | "MASKED" | "FLAGGED"
  createdAt: string
  senderFirstName?: string
  reactions?: Reaction[]
  attachments?: Attachment[]
  /** Local only: a message that hasn't reached the server yet. */
  pending?: boolean
  failed?: boolean
  clientMessageId?: string
}

export type ThreadInfo = {
  id: string
  status: ThreadStatus
  listingId?: string
  listingTitle?: string
  otherLastReadId?: string | null
  otherReadAt?: string | null
  otherTyping?: boolean
  otherTypingName?: string | null
  /** Lister side only, when the API includes it (needed to block). */
  customerId?: string
  assignedTo?: string | null
}

export type MessagesPage = {
  items: ChatMessage[]
  nextBefore?: string | null
  inquiry: ThreadInfo
}

export const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const

const base = (side: ChatSide) =>
  side === "lister" ? "/api/v1/lister" : "/api/v1"
const get = async <T>(path: string) =>
  (await apiRequest<ApiSuccess<T>>(path)).data
const send = async <T>(method: string, path: string, body: unknown = {}) =>
  (
    await apiRequest<ApiSuccess<T>>(path, {
      method,
      body: JSON.stringify(body),
    })
  ).data

export const inquiriesApi = {
  /** Customer: message the lister about a listing. */
  start: (listingId: string, body: string, clientMessageId: string) =>
    send<{ inquiryId: string; message: ChatMessage }>(
      "POST",
      `/api/v1/listings/${listingId}/inquiries`,
      { body, clientMessageId }
    ),
  inbox: (
    side: ChatSide,
    opts: { before?: string; assignedToMe?: boolean; limit?: number } = {}
  ) =>
    get<InboxPage>(
      `${base(side)}/inquiries?limit=${opts.limit ?? 30}${
        opts.before ? `&before=${encodeURIComponent(opts.before)}` : ""
      }${opts.assignedToMe ? "&assignedToMe=true" : ""}`
    ),
  unread: async (side: ChatSide) =>
    (await get<{ unread: number }>(`${base(side)}/inquiries/unread-count`))
      .unread,
  messages: (
    side: ChatSide,
    id: string,
    opts: { before?: string; after?: string; limit?: number } = {}
  ) =>
    get<MessagesPage>(
      `${base(side)}/inquiries/${id}/messages?limit=${opts.limit ?? 30}${
        opts.before ? `&before=${opts.before}` : ""
      }${opts.after ? `&after=${opts.after}` : ""}`
    ),
  send: (
    side: ChatSide,
    id: string,
    body: {
      body: string
      clientMessageId: string
      attachmentIds?: string[]
    }
  ) =>
    send<ChatMessage>("POST", `${base(side)}/inquiries/${id}/messages`, body),
  read: (side: ChatSide, id: string) =>
    send<{ unread: number }>("POST", `${base(side)}/inquiries/${id}/read`),
  close: (side: ChatSide, id: string) =>
    send<unknown>("POST", `${base(side)}/inquiries/${id}/close`),
  typing: (side: ChatSide, id: string) =>
    send<unknown>("POST", `${base(side)}/inquiries/${id}/typing`),
  react: (side: ChatSide, messageId: string, emoji: string | null) =>
    send<{ reactions: Reaction[] }>(
      "PUT",
      `${base(side)}/messages/${messageId}/reaction`,
      { emoji }
    ),
  reactions: (side: ChatSide, id: string, since?: string) =>
    get<{
      items: { messageId: string; reactions: Reaction[] }[]
      serverTime: string
    }>(
      `${base(side)}/inquiries/${id}/reactions${
        since ? `?since=${encodeURIComponent(since)}` : ""
      }`
    ),
  report: (side: ChatSide, messageId: string, reason: string) =>
    send<unknown>("POST", `${base(side)}/messages/${messageId}/report`, {
      reason,
    }),
  presign: (
    side: ChatSide,
    id: string,
    body: { contentType: string; sizeBytes: number }
  ) =>
    send<{
      attachmentId: string
      uploadUrl: string
      method: "PUT"
      headers: Record<string, string>
    }>("POST", `${base(side)}/inquiries/${id}/attachments/presign`, body),
  confirm: (side: ChatSide, id: string, attachmentId: string) =>
    send<{ attachmentId: string; status: string }>(
      "POST",
      `${base(side)}/inquiries/${id}/attachments/${attachmentId}/confirm`
    ),
  // Lister only
  assign: (id: string, userId: string) =>
    send<unknown>("POST", `/api/v1/lister/inquiries/${id}/assign`, { userId }),
  block: (customerId: string) =>
    send<unknown>("POST", "/api/v1/lister/blocks", { customerId }),
  unblock: (customerId: string) =>
    send<unknown>("DELETE", `/api/v1/lister/blocks/${customerId}`),
}
