"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { lagosDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const pad = (n: number) => String(n).padStart(2, "0")
const toDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number)
  return new Date(y, m - 1, d, 12)
}
const toDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/**
 * One date from a calendar popover, with optional quick picks. The value is
 * "YYYY-MM-DD" in Lagos time; days before today or after `maxDays` are off.
 */
export function DatePicker({
  value,
  onChange,
  maxDays = 30,
  shortcuts,
  placeholder = "Pick a date",
  className,
  id,
}: {
  value: string
  onChange: (value: string) => void
  /** How far ahead a date can be chosen, counted from today. */
  maxDays?: number
  /** Quick picks, as a label and a number of days from today. */
  shortcuts?: { label: string; days: number }[]
  placeholder?: string
  className?: string
  id?: string
}) {
  const [open, setOpen] = React.useState(false)
  const today = React.useMemo(() => toDate(lagosDate(0)), [])
  const last = React.useMemo(() => toDate(lagosDate(maxDays)), [maxDays])
  const selected = value ? toDate(value) : undefined

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            data-empty={!value}
            className="h-12 justify-start gap-2.5 px-4 text-sm font-normal data-[empty=true]:text-muted-foreground"
          >
            <CalendarDays className="size-4 text-primary" />
            {selected
              ? selected.toLocaleDateString("en-NG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto gap-0 p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? today}
            onSelect={(date) => {
              if (!date) return
              onChange(toDay(date))
              setOpen(false)
            }}
            disabled={[{ before: today }, { after: last }]}
            startMonth={today}
            endMonth={last}
          />
        </PopoverContent>
      </Popover>

      {shortcuts?.length ? (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Quick picks"
        >
          {shortcuts.map(({ label, days }) => {
            const day = lagosDate(days)
            const on = value === day
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(day)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
