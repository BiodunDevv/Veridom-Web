"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { RetryState } from "@/components/retry-state"
import { useSlots } from "@/features/deals/hooks"
import { formatDay, formatTime, lagosDate } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Free viewing times for the next two weeks, grouped by day (Lagos time). */
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

  const days = React.useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const { startsAt } of slots.data ?? []) {
      const day = formatDay(startsAt)
      groups.set(day, [...(groups.get(day) ?? []), startsAt])
    }
    return [...groups.entries()]
  }, [slots.data])

  if (slots.isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Finding free times…
      </p>
    )
  }
  if (slots.isError)
    return <RetryState label="free times" onRetry={() => slots.refetch()} />
  if (days.length === 0)
    return (
      <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
        No free times in the next two weeks. Check back soon.
      </p>
    )

  return (
    <div className="flex flex-col gap-4">
      {days.map(([day, times]) => (
        <fieldset key={day} className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">{day}</legend>
          <div className="flex flex-wrap gap-2">
            {times.map((startsAt) => (
              <button
                key={startsAt}
                type="button"
                aria-pressed={value === startsAt}
                onClick={() => onChange(startsAt)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  value === startsAt
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-accent"
                )}
              >
                {formatTime(startsAt)}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
