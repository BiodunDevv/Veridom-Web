"use client"

import * as React from "react"
import { CalendarClock, CalendarX2, CheckCircle2, Loader2, Moon, Sun, Sunrise } from "lucide-react"

import { RetryState } from "@/components/retry-state"
import { useSlots } from "@/features/deals/hooks"
import { formatDay, formatTime, lagosDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type DayGroup = {
  key: string
  date: Date
  slots: { startsAt: string; endsAt?: string }[]
}

const TZ = "Africa/Lagos"
const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ })
const hourOf = (iso: string) =>
  Number(
    new Date(iso).toLocaleString("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: TZ,
    })
  )
const part = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-NG", { ...opts, timeZone: TZ })

const PARTS = [
  { label: "Morning", icon: Sunrise, test: (h: number) => h < 12 },
  { label: "Afternoon", icon: Sun, test: (h: number) => h >= 12 && h < 17 },
  { label: "Evening", icon: Moon, test: (h: number) => h >= 17 },
]

/** Free viewing times for the next two weeks: pick a day, then a time (Lagos time). */
export function SlotPicker({
  listingId,
  enabled = true,
  value,
  onChange,
}: {
  listingId: string
  enabled?: boolean
  value: string | null
  onChange: (startsAt: string) => void
}) {
  const slots = useSlots(listingId, lagosDate(0), lagosDate(14), enabled)
  const [picked, setPicked] = React.useState<string | null>(null)

  const days = React.useMemo<DayGroup[]>(() => {
    const groups = new Map<string, DayGroup>()
    for (const slot of slots.data ?? []) {
      const key = dayKey(slot.startsAt)
      const group = groups.get(key) ?? {
        key,
        date: new Date(slot.startsAt),
        slots: [],
      }
      group.slots.push(slot)
      groups.set(key, group)
    }
    return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key))
  }, [slots.data])

  if (slots.isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4 overflow-hidden" aria-busy>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 w-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Finding free times…
        </p>
      </div>
    )
  }
  if (slots.isError)
    return <RetryState label="free times" onRetry={() => slots.refetch()} />
  if (days.length === 0)
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 px-6 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <CalendarX2 className="size-5" />
        </span>
        <p className="font-semibold">No free times right now</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          The lister hasn&apos;t opened viewing times for the next two weeks.
          Check back soon, or send them a message.
        </p>
      </div>
    )

  const selectedKey = value ? dayKey(value) : picked
  const active = days.find((d) => d.key === selectedKey) ?? days[0]
  const chosen = value
    ? active.slots.find((s) => s.startsAt === value) ??
      days.flatMap((d) => d.slots).find((s) => s.startsAt === value)
    : undefined

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div
        role="tablist"
        aria-label="Choose a day"
        className="-mx-1 flex w-[calc(100%+0.5rem)] max-w-none min-w-0 snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]"
      >
        {days.map((day) => {
          const on = day.key === active.key
          const iso = day.slots[0].startsAt
          return (
            <button
              key={day.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setPicked(day.key)}
              className={cn(
                "flex w-[4.5rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                on
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-input bg-background hover:-translate-y-0.5 hover:bg-accent"
              )}
            >
              <span className="text-xs font-medium uppercase opacity-80">
                {part(iso, { weekday: "short" })}
              </span>
              <span className="text-xl leading-none font-semibold tabular-nums">
                {part(iso, { day: "numeric" })}
              </span>
              <span className="text-xs opacity-80">
                {part(iso, { month: "short" })}
              </span>
              <span
                className={cn(
                  "mt-1 rounded-full px-1.5 text-[10px] font-medium",
                  on ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                )}
              >
                {day.slots.length} {day.slots.length === 1 ? "time" : "times"}
              </span>
            </button>
          )
        })}
      </div>

      <div key={active.key} className="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-1">
        {PARTS.map(({ label, icon: Icon, test }) => {
          const times = active.slots.filter((s) => test(hourOf(s.startsAt)))
          if (!times.length) return null
          return (
            <fieldset key={label} className="flex flex-col gap-2">
              <legend className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <Icon className="size-3.5" aria-hidden /> {label}
              </legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {times.map(({ startsAt }) => {
                  const on = value === startsAt
                  return (
                    <button
                      key={startsAt}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onChange(startsAt)}
                      className={cn(
                        "h-11 rounded-xl border text-sm font-medium tabular-nums transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        on
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      {formatTime(startsAt)}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        })}
      </div>

      <div
        aria-live="polite"
        className={cn(
          "flex items-center gap-3 rounded-xl p-3.5 text-sm transition-colors",
          chosen ? "bg-primary/10" : "bg-muted/50 text-muted-foreground"
        )}
      >
        {chosen ? (
          <>
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <span>
              <span className="font-semibold">{formatDay(chosen.startsAt)}</span>
              {" · "}
              {formatTime(chosen.startsAt)}
              {chosen.endsAt ? ` – ${formatTime(chosen.endsAt)}` : ""}
            </span>
          </>
        ) : (
          <>
            <CalendarClock className="size-5 shrink-0" />
            Pick a time to continue.
          </>
        )}
      </div>
    </div>
  )
}
