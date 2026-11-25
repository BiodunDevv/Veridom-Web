import type { UserStatus } from "@/lib/api/types"

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      })
    : "Not available"

/**
 * A calendar date with no clock time ("9 Dec 2026"). Move-in and tenancy dates
 * come as plain dates, so reading them in Lagos time would add a false "01:00".
 */
export const formatCalendarDate = (value?: string | null) => {
  if (!value) return "Not available"
  const plain = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0]
  return new Date(plain ? `${plain}T12:00:00Z` : value).toLocaleDateString(
    "en-NG",
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
  )
}

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
