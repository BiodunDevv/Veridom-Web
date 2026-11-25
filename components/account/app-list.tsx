"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Grouped list, the way settings screens in mobile apps look: a small
 * caption over one rounded card of rows separated by hairlines.
 */
export function ListGroup({
  label,
  action,
  className,
  children,
}: {
  label?: string
  /** Something small on the caption's right, such as "2 of 5". */
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </h2>
          {action}
        </div>
      ) : null}
      <ul className="divide-y overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        {children}
      </ul>
    </section>
  )
}

type RowProps = {
  icon: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Shown before the chevron: a count, a status pill, a button. */
  trailing?: React.ReactNode
  busy?: boolean
  disabled?: boolean
  /** Hide the chevron, for rows whose trailing is itself the action. */
  noChevron?: boolean
} & ({ href: string; onClick?: never } | { onClick?: () => void; href?: never })

/** One tappable row: icon tile, title and subtitle, trailing bit, chevron. */
export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  busy,
  disabled,
  noChevron,
  href,
  onClick,
}: RowProps) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-[18px]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        {subtitle ? (
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing}
      {busy ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : noChevron ? null : (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </>
  )
  const cls =
    "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent active:bg-accent disabled:pointer-events-none disabled:opacity-60"

  return (
    <li>
      {href ? (
        <Link href={href} className={cls}>
          {body}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || busy}
          className={cls}
        >
          {body}
        </button>
      )}
    </li>
  )
}

/** A small rounded count, green when there is something new. */
export function CountPill({
  value,
  tone = "muted",
}: {
  value: React.ReactNode
  tone?: "muted" | "new"
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        tone === "new"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {value}
    </span>
  )
}

/** A row of tappable numbers along the bottom of a header card. */
export function MetricRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <nav aria-label={label} className="flex divide-x border-t py-1">
      {children}
    </nav>
  )
}

/** One number in a MetricRow: value over label, a green dot when new. */
export function MetricLink({
  href,
  label,
  value,
  fresh,
}: {
  href: string
  label: string
  value: number | undefined
  /** Something new waiting: a green dot beside the label. */
  fresh?: boolean
}) {
  // The wrapper carries the straight divider; the link inside gets the
  // rounded hover, so the divider never bends around its corners.
  return (
    <div className="flex min-w-0 flex-1 px-0.5">
      <Link
        href={href}
        className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent active:bg-accent"
      >
        <span className="text-lg leading-tight font-semibold tabular-nums">
          {value ?? "–"}
        </span>
        <span className="flex max-w-full items-center gap-1 truncate text-[11px] text-muted-foreground">
          {fresh ? (
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-primary"
            />
          ) : null}
          <span className="truncate">{label}</span>
        </span>
      </Link>
    </div>
  )
}
