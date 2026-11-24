"use client"

import * as React from "react"
import { CalendarOff, CalendarPlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { lagosDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const MAX_DAYS = 366

/** "2026-12-25" -> a local Date at midday, so the day never shifts with time zones. */
const parse = (value: string) => {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d, 12)
}
const pad = (n: number) => String(n).padStart(2, "0")
const stringify = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const long = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
})

/**
 * Pick the days you can't show the property. The calendar stays open so several
 * dates can be ticked in one go; weekdays that are already closed are dimmed.
 */
export function DaysOffPicker({
  value: rawValue,
  onChange,
  openWeekdays,
}: {
  value: string[]
  onChange: (next: string[]) => void
  openWeekdays: Set<number>
}) {
  // The API may hand dates back as full timestamps; only the calendar day matters.
  const value = React.useMemo(
    () =>
      [
        ...new Set(
          rawValue
            .map((d) => /^\d{4}-\d{2}-\d{2}/.exec(d)?.[0])
            .filter((d): d is string => Boolean(d))
        ),
      ].sort(),
    [rawValue]
  )
  const selected = React.useMemo(() => value.map(parse), [value])
  const today = React.useMemo(() => parse(lagosDate(0)), [])
  const full = value.length >= MAX_DAYS

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              <CalendarPlus />
              {value.length ? "Edit days off" : "Pick days off"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto gap-0 p-0">
            <Calendar
              mode="multiple"
              selected={selected}
              onSelect={(days) =>
                onChange(
                  (days ?? [])
                    .map(stringify)
                    .sort()
                    .slice(0, MAX_DAYS)
                )
              }
              defaultMonth={selected[0] ?? today}
              disabled={[
                { before: today },
                ...(full ? [(d: Date) => !value.includes(stringify(d))] : []),
              ]}
              modifiers={{ closed: (d) => !openWeekdays.has(d.getDay()) }}
              modifiersClassNames={{ closed: "opacity-45" }}
              captionLayout="dropdown"
              startMonth={today}
              endMonth={new Date(today.getFullYear() + 2, 11, 31)}
            />
            <div className="flex items-center justify-between gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
              <span>
                {value.length
                  ? `${value.length} day${value.length === 1 ? "" : "s"} selected`
                  : "Tap dates to switch them off"}
              </span>
              {value.length ? (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => onChange([])}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
        {value.length ? (
          <span className="text-sm text-muted-foreground">
            {value.length} day{value.length === 1 ? "" : "s"} off
          </span>
        ) : null}
      </div>

      {value.length ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((d) => {
            const unused = !openWeekdays.has(parse(d).getDay())
            return (
              <li
                key={d}
                className={cn(
                  "inline-flex animate-in items-center gap-2 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm fade-in zoom-in-95",
                  unused && "text-muted-foreground"
                )}
                title={unused ? "You're already closed this weekday" : undefined}
              >
                <CalendarOff className="size-3.5 text-primary" aria-hidden />
                {long.format(parse(d))}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Remove ${long.format(parse(d))}`}
                  onClick={() => onChange(value.filter((x) => x !== d))}
                >
                  <X />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No days off. Add public holidays or trips so customers can&apos;t book
          those dates.
        </p>
      )}
    </div>
  )
}
