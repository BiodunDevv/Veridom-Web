"use client"

import * as React from "react"
import { Loader2, type LucideIcon } from "lucide-react"

import {
  Illustration,
  type IllustrationName,
} from "@/components/ui/illustration"
import { PatternBg } from "@/components/ui/pattern-bg"
import { RowsSkeleton } from "@/components/ui/page-skeletons"
import { cn } from "@/lib/utils"

/** Counts a number up from 0 when it first appears (skipped for reduced motion). */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = React.useState(0)
  React.useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = reduced ? 1 : Math.min((now - start) / 650, 1)
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <>{value === 0 ? 0 : shown}</>
}

export type HeroStat = {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: "default" | "good" | "warn"
}

/**
 * The page's numbers as one quiet row, the way mobile apps show a summary:
 * value over label, hairline dividers, no boxes. Scrolls sideways if it runs
 * out of room on a small phone.
 */
function StatStrip({
  stats,
  loading,
}: {
  stats: HeroStat[]
  loading?: boolean
}) {
  return (
    <dl className="-mx-1 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-1 shrink-0 flex-col-reverse gap-0.5 border-l px-2.5 whitespace-nowrap first:border-l-0 first:pl-1 sm:px-4"
        >
          <dt className="flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-xs">
            {stat.tone === "warn" || stat.tone === "good" ? (
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  stat.tone === "warn" ? "bg-amber-500" : "bg-primary"
                )}
              />
            ) : null}
            <span>{stat.label}</span>
          </dt>
          <dd className="text-lg leading-tight font-semibold tracking-tight tabular-nums sm:text-xl">
            {loading ? (
              <span className="inline-block h-5 w-8 animate-pulse rounded bg-muted align-middle" />
            ) : typeof stat.value === "number" ? (
              <CountUp value={stat.value} />
            ) : (
              stat.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
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
      <div className="flex flex-col gap-3.5 p-4 sm:gap-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-11">
              <Icon className="size-[18px] sm:size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              {eyebrow ? (
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                  {eyebrow}
                </span>
              ) : null}
              <h1 className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                {title}
              </h1>
              {description ? (
                <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground sm:line-clamp-none">
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
          <div className="border-t pt-3 sm:pt-4">
            <StatStrip stats={stats} loading={loading} />
          </div>
        ) : null}
      </div>
    </header>
  )
}

/** A friendly empty state with the pattern behind it. */
export function ListerEmpty({
  icon: Icon,
  art,
  title,
  hint,
  action,
}: {
  icon: LucideIcon
  /** A product illustration shown instead of the icon. */
  art?: IllustrationName
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative isolate flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-card px-6 text-center shadow-md",
        art ? "py-8 sm:py-10" : "py-14"
      )}
    >
      {art ? (
        <Illustration name={art} className="mb-1" />
      ) : (
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-5" aria-hidden />
        </span>
      )}
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
  return <RowsSkeleton rows={rows} />
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
