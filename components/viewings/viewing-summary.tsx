"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarClock,
  Check,
  CircleAlert,
  CheckCheck,
  Clock3,
  DoorOpen,
  Info,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  UserRound,
  Send,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { ListerHero } from "@/components/lister/lister-ui"
import type { Inspection } from "@/lib/api/deals"
import { formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const lagos = (value: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    ...opts,
  })

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Requested", icon: Send },
  { label: "Confirmed", icon: CalendarCheck },
  { label: "Visit", icon: DoorOpen },
  { label: "Done", icon: CheckCheck },
]
const STEP_OF: Record<string, number> = {
  REQUESTED: 0,
  PROPOSED: 0,
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
}
/** What is happening now, in plain words, for the person looking at the page. */
const NEXT: Record<"customer" | "lister", Record<string, string>> = {
  customer: {
    REQUESTED: "Waiting for the lister to confirm. They have 24 hours.",
    PROPOSED: "The lister suggested another time. Accept it or pick your own.",
    CONFIRMED: "You're confirmed. Check in from 15 minutes before the start.",
    IN_PROGRESS: "The visit is underway.",
    COMPLETED: "All done. Let us know how it went.",
  },
  lister: {
    REQUESTED: "Accept, decline or suggest another time within 24 hours.",
    PROPOSED: "Waiting for the customer to answer your new time.",
    CONFIRMED: "Confirmed. Check in from 15 minutes before the start.",
    IN_PROGRESS: "The visit is underway. Mark it complete when it ends.",
    COMPLETED: "The visit is complete.",
  },
}
const ENDED: Record<string, string> = {
  CANCELLED: "This viewing was cancelled.",
  DECLINED: "This viewing request was declined.",
  EXPIRED: "This request expired before it was answered.",
  NO_SHOW: "Someone didn't show up for this viewing.",
}

/** "in 2h 15m", "in 3 days" or "started"; refreshed by the caller's clock. */
function countdown(startsAt: string | undefined, now: number) {
  if (!startsAt) return { value: "TBC", hint: "Time to be agreed" }
  const diff = Date.parse(startsAt) - now
  if (diff <= 0) return { value: "Now", hint: "Already started" }
  const mins = Math.round(diff / 60_000)
  if (mins < 60) return { value: `${mins}m`, hint: "Until the start" }
  const hours = Math.floor(mins / 60)
  if (hours < 24)
    return { value: `${hours}h ${mins % 60}m`, hint: "Until the start" }
  const days = Math.floor(hours / 24)
  return {
    value: `${days} day${days === 1 ? "" : "s"}`,
    hint: "Until the start",
  }
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:size-9">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          {label}
        </dt>
        <dd className="text-sm leading-snug font-medium break-words">
          {children}
        </dd>
      </div>
    </div>
  )
}

/** Progress of the viewing from request to done, with the current step lit. */
function Progress({
  status,
  side,
}: {
  status: string
  side: "customer" | "lister"
}) {
  const step = STEP_OF[status]
  const ended = ENDED[status]
  const finished = status === "COMPLETED"
  return (
    <section
      aria-label="Viewing progress"
      className="rounded-2xl bg-card p-4 shadow-md sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Progress
        </span>
        <span className="sm:hidden">
          <StatusBadge status={status} />
        </span>
      </div>

      {ended ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden /> {ended}
        </p>
      ) : (
        <>
          <ol className="flex items-start">
            {STEPS.map(({ label, icon: Icon }, i) => {
              const done =
                step !== undefined && (i < step || (finished && i === step))
              const current = step === i && !finished
              return (
                <React.Fragment key={label}>
                  {i > 0 ? (
                    <li
                      aria-hidden
                      className="mt-[1.125rem] h-1 min-w-4 flex-1 overflow-hidden rounded-full bg-muted sm:mt-5"
                    >
                      <span
                        className="block h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out"
                        style={{
                          transform: `scaleX(${i <= (step ?? -1) ? 1 : 0})`,
                          transitionDelay: `${i * 120}ms`,
                        }}
                      />
                    </li>
                  ) : null}
                  <li
                    aria-current={current ? "step" : undefined}
                    className="flex w-14 shrink-0 flex-col items-center gap-1.5 text-center sm:w-20"
                  >
                    <span
                      className={cn(
                        "relative grid size-9 place-items-center rounded-full transition-all duration-500 sm:size-10",
                        done
                          ? "bg-primary text-primary-foreground shadow-md"
                          : current
                            ? "bg-primary/15 text-primary ring-2 ring-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <Check className="size-[18px] animate-in zoom-in-50 sm:size-5" />
                      ) : (
                        <Icon className="size-[18px] sm:size-5" />
                      )}
                      {current ? (
                        <span className="absolute inset-0 rounded-full bg-primary/30 [animation-duration:2.4s] motion-safe:animate-ping" />
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] leading-tight font-medium sm:text-xs",
                        current || done
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </li>
                </React.Fragment>
              )
            })}
          </ol>
          {NEXT[side][status] ? (
            <p
              key={status}
              className="mt-4 flex animate-in items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground fade-in slide-in-from-bottom-1"
            >
              <Info
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              {NEXT[side][status]}
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}

export function ViewingSummary({
  inspection,
  backHref,
  actions,
  side = "customer",
}: {
  inspection: Inspection
  backHref: string
  actions?: React.ReactNode
  side?: "customer" | "lister"
}) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const { startsAt, endsAt } = inspection
  const address = inspection.addressLine ?? inspection.listing?.addressLine
  const title =
    inspection.listing?.title ?? inspection.listingTitle ?? "Property viewing"
  const listingId = inspection.listing?.id ?? inspection.listingId
  const live = !ENDED[inspection.status] && inspection.status !== "COMPLETED"
  const left = countdown(startsAt, now)
  const mineIn =
    side === "customer"
      ? inspection.customerCheckedIn
      : inspection.attendeeCheckedIn
  const theirsIn =
    side === "customer"
      ? inspection.attendeeCheckedIn
      : inspection.customerCheckedIn
  const checkedCount = Number(Boolean(mineIn)) + Number(Boolean(theirsIn))

  return (
    <>
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All viewings
      </Link>

      <ListerHero
        icon={CalendarCheck}
        eyebrow={side === "lister" ? "Viewing request" : "Your viewing"}
        title={title}
        description={
          startsAt
            ? `${lagos(startsAt, { weekday: "long", day: "numeric", month: "long" })} · ${formatTime(startsAt)}${endsAt ? ` – ${formatTime(endsAt)}` : ""}`
            : "Time to be agreed"
        }
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
            <span className="hidden sm:inline-flex">
              <StatusBadge status={inspection.status} />
            </span>
            {actions}
          </div>
        }
        stats={[
          {
            label: "Date",
            value: startsAt
              ? lagos(startsAt, { day: "numeric", month: "short" })
              : "TBC",
            icon: CalendarClock,
            hint: startsAt ? lagos(startsAt, { weekday: "long" }) : undefined,
          },
          {
            label: "Time",
            value: startsAt ? formatTime(startsAt) : "TBC",
            icon: Clock3,
            hint: endsAt ? `Until ${formatTime(endsAt)}` : "Lagos time",
          },
          {
            label: live ? "Starts in" : "Status",
            value: live ? left.value : inspection.status.replace("_", " "),
            icon: Clock3,
            tone: live ? "good" : "default",
            hint: live ? left.hint : undefined,
          },
          {
            label: "Checked in",
            value: `${checkedCount} of 2`,
            icon: KeyRound,
            tone: checkedCount === 2 ? "good" : "default",
            hint: mineIn ? "You are in" : "Opens 15 min before",
          },
        ]}
      />

      {inspection.proposedStartsAt
        ? (() => {
            const mine =
              inspection.proposedBy ===
              (side === "customer" ? "CUSTOMER" : "LISTER")
            const when = `${lagos(inspection.proposedStartsAt, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })} at ${formatTime(inspection.proposedStartsAt)}`
            const other = side === "customer" ? "the lister" : "the customer"
            return (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm sm:gap-3 sm:p-4"
              >
                <CalendarClock
                  className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden
                />
                <div>
                  <p className="font-semibold">
                    {mine
                      ? "Waiting for a reply to your new time"
                      : "A new time was proposed"}
                  </p>
                  <p className="text-muted-foreground">
                    {mine
                      ? `You suggested ${when}. We're waiting for ${other} to answer.`
                      : `${when}. Use Manage viewing to answer.`}
                  </p>
                </div>
              </div>
            )
          })()
        : null}

      <Progress status={inspection.status} side={side} />

      <section className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-md sm:gap-4 sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">Details</h2>
        <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Row icon={Building2} label="Property">
            {listingId && side === "customer" ? (
              <Link
                href={`/properties/${listingId}`}
                className="hover:text-primary hover:underline"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </Row>
          {side === "lister" && inspection.customerFirstName ? (
            <Row icon={UserRound} label="Customer">
              {inspection.customerFirstName}
            </Row>
          ) : null}
          {side === "lister" && inspection.customerEmail ? (
            <Row icon={Mail} label="Customer email">
              {inspection.customerEmail}
            </Row>
          ) : null}
          <Row icon={MapPin} label="Address">
            {address ?? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Lock className="size-3.5" aria-hidden />
                {side === "customer"
                  ? "Shared once the lister confirms"
                  : "Shown to the customer once confirmed"}
              </span>
            )}
          </Row>
          <Row
            icon={UsersRound}
            label={side === "customer" ? "You'll meet" : "Attending"}
          >
            {inspection.attendee?.firstName ?? (
              <span className="text-muted-foreground">
                {side === "customer"
                  ? "Named once the lister confirms"
                  : "Not assigned yet"}
              </span>
            )}
          </Row>
        </dl>
      </section>
    </>
  )
}
