"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarClock, CalendarPlus, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAvailability } from "@/features/lister/ops-hooks"
import { previewSlots, summariseWindows, weekdayShort } from "@/lib/viewing-slots"
import { cn } from "@/lib/utils"

/** Live status of a listing's viewing times, with a way to set or change them. */
export function ViewingTimesCard({ listingId }: { listingId: string }) {
  const query = useAvailability(listingId)
  const href = `/lister/listings/${listingId}/availability`
  const av = query.data
  const open = new Set(av?.windows.map((w) => w.weekday) ?? [])
  const isSet = Boolean(av && av.windows.length > 0)
  const next = React.useMemo(() => (av ? previewSlots(av, 1)[0] : undefined), [av])

  return (
    <section
      aria-labelledby="viewing-times-title"
      className="rounded-2xl bg-card p-5 shadow-md"
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            isSet ? "bg-primary/10 text-primary" : "bg-amber-500/15 text-amber-600"
          )}
        >
          <CalendarClock className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id="viewing-times-title" className="font-semibold">
            Viewing times
          </h2>
          <p className="text-sm text-muted-foreground">
            {query.isPending
              ? "Checking…"
              : isSet
                ? "Customers can book you"
                : "Customers can't book yet"}
          </p>
        </div>
      </div>

      {query.isPending ? (
        <Skeleton className="mt-4 h-16 w-full rounded-lg" />
      ) : (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1" aria-hidden>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <span
                key={d}
                className={cn(
                  "grid h-9 place-items-center rounded-md text-[11px] font-medium transition-colors",
                  open.has(d)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {weekdayShort(d).slice(0, 2)}
              </span>
            ))}
          </div>

          {av && isSet ? (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
              {summariseWindows(av).map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                {av.slotMinutes}-minute visits
                {av.autoConfirm ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary">
                    <Zap className="size-3" /> auto-confirm
                  </span>
                ) : null}
              </li>
              {next ? (
                <li className="mt-1 text-foreground">
                  Next open time:{" "}
                  <span className="font-medium">
                    {new Date(next).toLocaleString("en-NG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Africa/Lagos",
                    })}
                  </span>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Pick the days and hours you can show this property. Until you do,
              the Book a viewing button has no times to offer.
            </p>
          )}

          <Button
            asChild
            variant={isSet ? "outline" : "default"}
            className="mt-4 w-full"
          >
            <Link href={href}>
              {isSet ? <CalendarClock /> : <CalendarPlus />}
              {isSet ? "Edit viewing times" : "Set viewing times"}
            </Link>
          </Button>
        </>
      )}
    </section>
  )
}
