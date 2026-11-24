"use client"

import * as React from "react"
import { CalendarDays, Clock3 } from "lucide-react"

import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { lagosDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const HOUR = 3_600_000
const pad = (n: number) => String(n).padStart(2, "0")
const toDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number)
  return new Date(y, m - 1, d, 12)
}
const toDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Every 30 minutes from 6:00 AM to 9:30 PM, labelled the way people say it. */
const TIMES = Array.from({ length: 32 }, (_, i) => {
  const mins = 6 * 60 + i * 30
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return {
    value: `${pad(h)}:${pad(m)}`,
    label: `${hour12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`,
  }
})

/** Lagos is UTC+1 all year, so a typed wall-clock time is an exact instant. */
export const localToInstant = (local: string) => Date.parse(`${local}:00+01:00`)

/** A viewing can be booked from 3 hours to 14 days ahead. */
export const isBookableTime = (local?: string, now = Date.now()) => {
  if (!local || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return false
  const at = localToInstant(local)
  return at >= now + 3 * HOUR && at <= now + 14 * 24 * HOUR
}

/**
 * Date and time for a viewing in Lagos time: a calendar for the day and a
 * time list in 30-minute steps. The value is "YYYY-MM-DDTHH:mm".
 */
export function DateTimePicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [now] = React.useState(() => Date.now())
  const [day, time] = value ? value.split("T") : ["", ""]
  const today = React.useMemo(() => toDate(lagosDate(0)), [])
  const last = React.useMemo(() => toDate(lagosDate(14)), [])
  const selected = day ? toDate(day) : undefined
  const invalid = Boolean(value) && !isBookableTime(value, now)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-empty={!day}
              className="h-11 justify-start gap-2 font-normal data-[empty=true]:text-muted-foreground"
            >
              <CalendarDays className="size-4 text-primary" />
              {selected
                ? selected.toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto gap-0 p-0">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected ?? today}
              onSelect={(date) => {
                if (!date) return
                onChange(`${toDay(date)}T${time || "09:00"}`)
                setOpen(false)
              }}
              disabled={[{ before: today }, { after: last }]}
              startMonth={today}
              endMonth={last}
            />
          </PopoverContent>
        </Popover>
        <FormSelect
          aria-label="Time"
          placeholder="Time"
          value={time}
          onChange={(e) => onChange(`${day || lagosDate(1)}T${e.target.value}`)}
          options={TIMES}
        />
      </div>

      <p
        aria-live="polite"
        className={cn(
          "flex items-center gap-1.5 text-xs",
          invalid ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <Clock3 className="size-3.5 shrink-0" aria-hidden />
        {invalid
          ? "Pick a time between 3 hours and 14 days from now."
          : "Lagos time. Between 3 hours and 14 days from now."}
      </p>
    </div>
  )
}
