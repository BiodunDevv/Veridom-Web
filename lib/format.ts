import type { UserStatus } from "@/lib/api/types"

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      })
    : "Not available"

/** The API stores money as integer kobo (₦1 = 100 kobo). */
export const formatNaira = (kobo?: number | null) =>
  typeof kobo === "number"
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(kobo / 100)
    : "—"

export const getStatusVariant = (
  status: UserStatus
): "default" | "secondary" | "destructive" => {
  if (status === "ACTIVE") return "default"
  if (status === "PENDING_VERIFICATION") return "secondary"
  return "destructive"
}

export const nairaToKobo = (naira: number) => Math.round(naira * 100)

/** 12-hour clock in Lagos time, e.g. "2:00 PM". */
export const formatTime = (value: string) =>
  new Date(value)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos",
    })
    .replace(/\s?(am|pm)$/i, (_, p: string) => ` ${p.toUpperCase()}`)

export const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  })

/** YYYY-MM-DD in Lagos, offset by whole days from now. */
export const lagosDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "Africa/Lagos",
  })
