"use client"

import * as React from "react"
import { CheckCircle2, Circle, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export type ReadinessItem = {
  label: string
  hint: string
  done: boolean
  /** Section to jump to when the item isn't done. */
  href?: string
}

/** What's left before a listing can go to review, with a live progress ring. */
export function ListingReadiness({ items }: { items: ReadinessItem[] }) {
  const done = items.filter((i) => i.done).length
  const pct = Math.round((done / items.length) * 100)
  const complete = done === items.length
  const radius = 26
  const circumference = 2 * Math.PI * radius

  return (
    <section
      aria-labelledby="ready-title"
      className="relative isolate overflow-hidden rounded-2xl bg-card p-5 shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              strokeWidth="6"
              className="stroke-muted"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          </svg>
          <span className="absolute text-sm font-semibold tabular-nums">
            {pct}%
          </span>
        </div>
        <div>
          <h2 id="ready-title" className="font-semibold">
            {complete ? "Ready for review" : "Ready to submit"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {complete
              ? "Everything is in place."
              : `${items.length - done} step${items.length - done === 1 ? "" : "s"} to go.`}
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        {items.map((item) => {
          const Row = item.href && !item.done ? "a" : "div"
          return (
            <li key={item.label}>
              <Row
                {...(item.href && !item.done ? { href: item.href } : {})}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                  item.href && !item.done && "hover:bg-accent"
                )}
              >
                {item.done ? (
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground/50"
                    aria-hidden
                  />
                )}
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block font-medium",
                      item.done && "text-muted-foreground line-through"
                    )}
                  >
                    {item.label}
                  </span>
                  {!item.done ? (
                    <span className="block text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
              </Row>
            </li>
          )
        })}
      </ul>

      {complete ? (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" aria-hidden /> Looking great. Submit
          when you&apos;re ready.
        </p>
      ) : null}
    </section>
  )
}
