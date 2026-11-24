import type { Availability } from "@/lib/api/lister"

const HOUR = 3_600_000
const DAY = 24 * HOUR
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export const weekdayShort = (weekday: number) => WEEKDAYS[weekday] ?? ""

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (m || 0)
}

const pad = (n: number) => String(n).padStart(2, "0")

/** A Lagos calendar date (YYYY-MM-DD) and weekday for an instant. Lagos is UTC+1, no DST. */
const lagosDay = (ms: number) => {
  const d = new Date(ms + HOUR)
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    weekday: d.getUTCDay(),
  }
}

/**
 * The next bookable times a customer would see for this availability: inside the
 * weekly windows, not on a day off, between 3 hours and 14 days from now.
 * It ignores existing viewings, so it is a preview, not the live slot list.
 */
export function previewSlots(av: Availability, limit = 6): number[] {
  const now = Date.now()
  const earliest = now + 3 * HOUR
  const latest = now + 14 * DAY
  const step = av.slotMinutes
  const out: number[] = []

  for (let i = 0; i <= 15 && out.length < limit; i++) {
    const { date, weekday } = lagosDay(now + i * DAY)
    if (av.blackoutDates.includes(date)) continue
    const windows = av.windows
      .filter((w) => w.weekday === weekday)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    for (const w of windows) {
      const end = toMinutes(w.endsAt)
      for (let m = toMinutes(w.startsAt); m + step <= end; m += step) {
        const at = Date.parse(`${date}T${pad(Math.floor(m / 60))}:${pad(m % 60)}:00+01:00`)
        if (at >= earliest && at <= latest) out.push(at)
        if (out.length >= limit) return out
      }
    }
  }
  return out
}

/** "Mon–Fri 09:00–17:00" style summary, grouping days that share the same hours. */
export function summariseWindows(av: Availability): string[] {
  const byHours = new Map<string, number[]>()
  for (const w of av.windows) {
    const key = `${w.startsAt}–${w.endsAt}`
    byHours.set(key, [...(byHours.get(key) ?? []), w.weekday])
  }
  return [...byHours.entries()].map(([hours, days]) => {
    const sorted = [...new Set(days)].sort((a, b) => a - b)
    const runs: string[] = []
    let i = 0
    while (i < sorted.length) {
      let j = i
      while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++
      runs.push(
        j - i >= 2
          ? `${weekdayShort(sorted[i])}–${weekdayShort(sorted[j])}`
          : sorted.slice(i, j + 1).map(weekdayShort).join(", ")
      )
      i = j + 1
    }
    return `${runs.join(", ")} ${hours}`
  })
}
