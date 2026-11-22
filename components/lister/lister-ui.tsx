"use client"

import * as React from "react"
import { Loader2, type LucideIcon } from "lucide-react"

import { PatternBg } from "@/components/ui/pattern-bg"
import { cn } from "@/lib/utils"

export type HeroStat = {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: "default" | "good" | "warn"
}

/**
 * Page banner for the lister area: the contour pattern, an icon chip, the title,
 * actions and a row of live numbers. Quiet in light, richer in dark.
 */
export function ListerHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  stats,
  loading,
}: {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  stats?: HeroStat[]
  loading?: boolean
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl bg-card shadow-md">
      <PatternBg className="-z-10 [mask-image:linear-gradient(to_left,black,transparent_75%)] object-right opacity-25 dark:opacity-45" />
      <div
        aria-hidden
        className="absolute -top-24 -left-16 -z-10 size-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              {eyebrow ? (
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                  {eyebrow}
                </span>
              ) : null}
              <h1 className="text-2xl leading-tight font-semibold tracking-tight">
                {title}
              </h1>
              {description ? (
                <p className="max-w-xl text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>

        {stats?.length ? (
          <dl className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 rounded-xl border bg-background/70 p-3.5 backdrop-blur-sm"
              >
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  {stat.icon ? (
                    <stat.icon
                      className={cn(
                        "size-3.5",
                        stat.tone === "good" && "text-primary",
                        stat.tone === "warn" &&
                          "text-amber-600 dark:text-amber-400"
                      )}
                      aria-hidden
                    />
                  ) : null}
                  {stat.label}
                </dt>
                <dd className="text-xl font-semibold tracking-tight tabular-nums">
                  {loading ? (
                    <span className="inline-block h-6 w-10 animate-pulse rounded bg-muted" />
                  ) : (
                    stat.value
                  )}
                </dd>
                {stat.hint ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {stat.hint}
                  </span>
                ) : null}
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  )
}

/** A friendly empty state with the pattern behind it. */
export function ListerEmpty({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="relative isolate flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-card px-6 py-14 text-center shadow-md">
      <PatternBg className="-z-10 [mask-image:radial-gradient(60%_80%_at_50%_50%,black,transparent)] opacity-20 dark:opacity-40" />
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="text-lg font-semibold">{title}</p>
      {hint ? (
        <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
      ) : null}
      {action}
    </div>
  )
}

/** Placeholder rows while a list loads. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="grid gap-3" aria-busy aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-md"
        >
          <span className="size-12 animate-pulse rounded-xl bg-muted" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <span className="h-3 w-1/5 animate-pulse rounded bg-muted/70" />
          </span>
          <span className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </li>
      ))}
    </ul>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />
}

/** "3 min ago", "2 days ago", falling back to a date for older items. */
export function timeAgo(value?: string | null): string {
  if (!value) return ""
  const diff = Date.now() - new Date(value).getTime()
  const min = Math.round(diff / 60_000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} hr ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  })
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?"
