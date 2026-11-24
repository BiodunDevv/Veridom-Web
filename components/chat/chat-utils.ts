import type { ChatMessage, ChatSide } from "@/lib/api/inquiries"
import { formatTime } from "@/lib/format"

export const basePathFor = (side: ChatSide) =>
  side === "lister" ? "/lister/inquiries" : "/account/messages"

export const timeLabel = (value: string) => formatTime(value)

const dayKey = (value: string) =>
  new Date(value).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" })

export const dayLabel = (value: string) => {
  const today = new Date()
  const yesterday = new Date(Date.now() - 86_400_000)
  const key = dayKey(value)
  if (key === dayKey(today.toISOString())) return "Today"
  if (key === dayKey(yesterday.toISOString())) return "Yesterday"
  return new Date(value).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Lagos",
  })
}

export const sameDay = (a: string, b: string) => dayKey(a) === dayKey(b)

/** Inbox time: a clock time today, otherwise the date. */
export const inboxTime = (value?: string | null) => {
  if (!value) return ""
  return sameDay(value, new Date().toISOString())
    ? timeLabel(value)
    : new Date(value).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Lagos",
      })
}

export const mySide = (side: ChatSide) =>
  side === "lister" ? "LISTER" : "CUSTOMER"

/** "Seen" when the other side's last read id has reached this message. */
export function isSeen(message: ChatMessage, otherLastReadId?: string | null) {
  if (!otherLastReadId || message.pending || message.id.startsWith("local-"))
    return false
  try {
    return BigInt(message.id) <= BigInt(otherLastReadId)
  } catch {
    return false
  }
}
