"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import {
  ListerEmpty,
  ListerHero,
  ListSkeleton,
} from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import type { Inspection } from "@/lib/api/deals"
import { formatTime } from "@/lib/format"

type Query = {
  isPending: boolean
  isError: boolean
  data?: Inspection[]
  refetch: () => unknown
}

const lagos = (value: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    ...opts,
  })

/** The viewings list for either side; each row opens the full viewing with its actions. */
export function ViewingList({
  query,
  title,
  description,
  basePath,
  emptyTitle,
  emptyHint,
  cta,
}: {
  query: Query
  title: string
  description: string
  basePath: string
  emptyTitle: string
  emptyHint: string
  cta?: { href: string; label: string }
}) {
  const items = query.data ?? []
  const [now] = React.useState(() => Date.now())
  const upcoming = items.filter(
    (v) => v.startsAt && new Date(v.startsAt).getTime() > now
  )
  const waiting = items.filter((v) =>
    ["REQUESTED", "PROPOSED"].includes(v.status)
  ).length
  const confirmed = items.filter((v) => v.status === "CONFIRMED").length
  const next = [...upcoming].sort(
    (a, b) => +new Date(a.startsAt!) - +new Date(b.startsAt!)
  )[0]

  return (
    <>
      <ListerHero
        icon={CalendarDays}
        eyebrow="Viewings"
        title={title}
        description={description}
        loading={query.isPending}
        stats={[
          {
            label: "Needs a reply",
            value: waiting,
            icon: Clock3,
            tone: waiting ? "warn" : "default",
            hint: waiting ? "Requested or proposed" : "Nothing waiting",
          },
          {
            label: "Confirmed",
            value: confirmed,
            icon: CalendarCheck,
            tone: "good",
          },
          { label: "Upcoming", value: upcoming.length, icon: CalendarClock },
          {
            label: "Next viewing",
            value: next?.startsAt
              ? lagos(next.startsAt, { day: "numeric", month: "short" })
              : "None",
            icon: CalendarDays,
            hint: next?.startsAt ? formatTime(next.startsAt) : undefined,
          },
        ]}
      />

      {query.isPending ? (
        <ListSkeleton />
      ) : query.isError ? (
        <RetryState label="viewings" onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <ListerEmpty
          icon={CalendarDays}
          title={emptyTitle}
          hint={emptyHint}
          action={
            cta ? (
              <Button asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="grid gap-3">
          {items.map((viewing) => (
            <li key={viewing.id}>
              <Link
                href={`${basePath}/${viewing.id}`}
                className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:p-5"
              >
                {viewing.startsAt ? (
                  <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <span className="text-[10px] font-semibold tracking-wide uppercase">
                      {lagos(viewing.startsAt, { month: "short" })}
                    </span>
                    <span className="text-xl leading-none font-semibold tabular-nums">
                      {lagos(viewing.startsAt, { day: "numeric" })}
                    </span>
                  </span>
                ) : null}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate font-semibold group-hover:text-primary">
                    {viewing.listing?.title ?? "Property viewing"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewing.startsAt
                      ? `${lagos(viewing.startsAt, { weekday: "long" })} · ${formatTime(viewing.startsAt)}`
                      : "Time to be agreed"}
                  </p>
                  {viewing.listing?.addressLine ? (
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      {viewing.listing.addressLine}
                    </p>
                  ) : null}
                </div>
                <StatusBadge status={viewing.status} />
                <ArrowUpRight
                  className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary sm:block"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
