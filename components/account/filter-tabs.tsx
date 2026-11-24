"use client"

import { cn } from "@/lib/utils"

export type FilterTab<T extends string> = {
  value: T
  label: string
  count: number
}

/** Pill filters with live counts, for lists like viewings and deals. */
export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
    >
      {tabs.map((tab) => {
        const on = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              on
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] leading-5 font-semibold tabular-nums",
                on ? "bg-primary-foreground/20" : "bg-muted"
              )}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
