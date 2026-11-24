"use client"

import * as React from "react"
import {
  Ban,
  CalendarClock,
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Loader2,
  MapPinCheck,
  Reply,
  UserRoundCog,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { SlotPicker } from "@/components/listings/detail/slot-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormSelect } from "@/components/site/form-select"
import { AdaptiveStepper } from "@/components/ui/adaptive-stepper"
import {
  DateTimePicker,
  isBookableTime,
  localToInstant,
} from "@/components/ui/date-time-picker"
import { Textarea } from "@/components/ui/textarea"
import { useAttendees } from "@/features/lister/org-hooks"
import { useAction } from "@/lib/query/use-action"
import {
  inspectionsApi,
  type Inspection,
  type InspectionOutcome,
} from "@/lib/api/deals"
import { listerApi } from "@/lib/api/lister"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"

type Value = {
  slot?: string
  time?: string
  reason?: string
  minutes?: number
  accept?: boolean
  outcome?: InspectionOutcome
  attendeeId?: string
  attended?: boolean
}
type Input =
  | "none"
  | "slot"
  | "time"
  | "reason"
  | "minutes"
  | "yesno"
  | "outcome"
  | "attendee"
  | "complete"

type ActionDef = {
  key: string
  label: string
  description?: string
  input: Input
  destructive?: boolean
  run: (inspection: Inspection, v: Value) => Promise<unknown>
}

/** Lagos is UTC+1 all year, so a typed wall-clock time becomes an exact instant. */
const lagosIso = (local: string) =>
  new Date(localToInstant(local)).toISOString()

const customerActions: ActionDef[] = [
  {
    key: "accept",
    label: "Accept new time",
    description: "Take the time the lister suggested.",
    input: "none",
    run: (i) => inspectionsApi.acceptProposal(i.id),
  },
  {
    key: "reschedule",
    label: "Reschedule",
    description: "Pick a new free time.",
    input: "slot",
    run: (i, v) => inspectionsApi.reschedule(i.id, v.slot!),
  },
  {
    key: "respond",
    label: "Answer a reschedule request",
    description: "The lister proposed another time.",
    input: "yesno",
    run: (i, v) => inspectionsApi.respondReschedule(i.id, v.accept!),
  },
  {
    key: "checkin",
    label: "I've arrived (check in)",
    description: "Available from 15 minutes before the start.",
    input: "none",
    run: (i) => inspectionsApi.checkIn(i.id),
  },
  {
    key: "extend",
    label: "Extend the viewing",
    description: "Add time in 30-minute steps.",
    input: "minutes",
    run: (i, v) => inspectionsApi.extend(i.id, v.minutes!),
  },
  {
    key: "noshow",
    label: "Report a no-show",
    description: "Only after checking in, 30 minutes past the start.",
    input: "none",
    destructive: true,
    run: (i) => inspectionsApi.reportNoShow(i.id),
  },
  {
    key: "outcome",
    label: "Record the outcome",
    description: "Tell us how the viewing went.",
    input: "outcome",
    run: (i, v) => inspectionsApi.outcome(i.id, v.outcome!, v.reason),
  },
  {
    key: "cancel",
    label: "Cancel viewing",
    description: "Under 2 hours before the start counts as a late cancel.",
    input: "reason",
    destructive: true,
    run: (i, v) => inspectionsApi.cancel(i.id, v.reason!),
  },
]

const listerActions: ActionDef[] = [
  {
    key: "accept",
    label: "Accept",
    description: "Confirm and share the address.",
    input: "none",
    run: (i) => listerApi.acceptInspection(i.id),
  },
  {
    key: "decline",
    label: "Decline",
    description: "Tell them why it can't happen.",
    input: "reason",
    destructive: true,
    run: (i, v) => listerApi.declineInspection(i.id, v.reason!),
  },
  {
    key: "propose",
    label: "Propose another time",
    description: "Suggest a time that suits you.",
    input: "time",
    run: (i, v) => listerApi.proposeInspection(i.id, lagosIso(v.time!)),
  },
  {
    key: "reschedule",
    label: "Reschedule",
    input: "time",
    run: (i, v) => listerApi.rescheduleInspection(i.id, lagosIso(v.time!)),
  },
  {
    key: "respond",
    label: "Answer a reschedule request",
    input: "yesno",
    run: (i, v) => listerApi.respondRescheduleInspection(i.id, v.accept!),
  },
  {
    key: "reassign",
    label: "Change who attends",
    description: "Hand the visit to another team member.",
    input: "attendee",
    run: (i, v) => listerApi.reassignInspection(i.id, v.attendeeId!),
  },
  {
    key: "checkin",
    label: "Check in",
    description: "Let them know you have arrived.",
    input: "none",
    run: (i) => listerApi.checkInInspection(i.id),
  },
  {
    key: "extend",
    label: "Extend the viewing",
    input: "minutes",
    run: (i, v) => listerApi.extendInspection(i.id, v.minutes!),
  },
  {
    key: "noshow",
    label: "Report a no-show",
    description: "The customer did not come.",
    input: "none",
    destructive: true,
    run: (i) => listerApi.reportNoShowInspection(i.id),
  },
  {
    key: "complete",
    label: "Mark as complete",
    description: "Record that the visit is done.",
    input: "complete",
    run: (i, v) =>
      listerApi.completeInspection(i.id, {
        customerAttended: Boolean(v.attended),
        note: v.reason,
      }),
  },
  {
    key: "cancel",
    label: "Cancel viewing",
    description: "The customer is told straight away.",
    input: "none",
    destructive: true,
    run: (i) => listerApi.cancelInspection(i.id),
  },
]

const TERMINAL = ["CANCELLED", "DECLINED", "COMPLETED", "NO_SHOW", "EXPIRED"]

const ICONS: Record<string, LucideIcon> = {
  accept: Check,
  decline: Ban,
  propose: CalendarPlus,
  reschedule: CalendarClock,
  respond: Reply,
  reassign: UserRoundCog,
  checkin: MapPinCheck,
  extend: Clock3,
  noshow: UserX,
  outcome: ClipboardCheck,
  complete: CheckCheck,
  cancel: XCircle,
}

const MIN = 60_000
type Availability =
  | { state: "ready" }
  | { state: "locked"; hint: string }
  | null

/**
 * Which actions make sense right now. Wrong status -> hidden. Right status but
 * too early or too late -> shown locked, with the reason.
 */
function availability(
  side: "customer" | "lister",
  key: string,
  i: Inspection,
  now: number
): Availability {
  const ready: Availability = { state: "ready" }
  const start = i.startsAt ? Date.parse(i.startsAt) : null
  const status = i.status
  const live = status === "CONFIRMED" || status === "IN_PROGRESS"
  const checkedIn =
    side === "customer" ? i.customerCheckedIn : i.attendeeCheckedIn

  switch (key) {
    case "accept":
      return (
        side === "customer" ? status === "PROPOSED" : status === "REQUESTED"
      )
        ? ready
        : null
    case "decline":
    case "propose":
      return status === "REQUESTED" ? ready : null
    case "reschedule":
      if (status !== "CONFIRMED") return null
      return start && start - now < 120 * MIN
        ? { state: "locked", hint: "Too close to the start to reschedule." }
        : ready
    case "respond":
      return status === "CONFIRMED" && i.proposedStartsAt ? ready : null
    case "reassign":
      return status === "REQUESTED" || status === "CONFIRMED" ? ready : null
    case "checkin":
      if (!live || checkedIn) return null
      return start && now < start - 15 * MIN
        ? { state: "locked", hint: "Opens 15 minutes before the start." }
        : ready
    case "extend":
      return status === "IN_PROGRESS" ? ready : null
    case "noshow":
      if (!live || !checkedIn) return null
      return start && now < start + 30 * MIN
        ? { state: "locked", hint: "Opens 30 minutes after the start." }
        : ready
    case "outcome":
      return status === "COMPLETED" ? ready : null
    case "complete":
      return status === "IN_PROGRESS" ||
        (status === "CONFIRMED" && start !== null && now >= start)
        ? ready
        : null
    case "cancel":
      return ["REQUESTED", "PROPOSED", "CONFIRMED"].includes(status)
        ? ready
        : null
    default:
      return null
  }
}

/** The one thing to suggest first, when there is an obvious next step. */
const PRIMARY: Record<"customer" | "lister", string[]> = {
  customer: ["accept", "checkin", "outcome"],
  lister: ["accept", "checkin", "complete"],
}
const choice =
  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors"

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        choice,
        on
          ? "border-primary bg-primary/10 text-primary"
          : "border-input hover:bg-accent"
      )}
    >
      {children}
    </button>
  )
}

function ActionItem({
  entry,
  index,
  onChoose,
}: {
  entry: { def: ActionDef; a: NonNullable<Availability> }
  index: number
  onChoose: () => void
}) {
  const { def, a } = entry
  const Icon = ICONS[def.key] ?? Check
  const locked = a.state === "locked"
  return (
    <DropdownMenuItem
      disabled={locked}
      variant={def.destructive ? "destructive" : "default"}
      onSelect={onChoose}
      style={{ animationDelay: `${index * 30}ms` }}
      className="animate-in items-start gap-3 rounded-lg px-2.5 py-2 fade-in slide-in-from-top-1"
    >
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
          def.destructive
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm leading-tight font-medium">{def.label}</span>
        <span className="text-xs leading-snug font-normal text-muted-foreground">
          {locked ? a.hint : def.description}
        </span>
      </span>
    </DropdownMenuItem>
  )
}

export function InspectionActions({
  inspection,
  side,
}: {
  inspection: Inspection
  side: "customer" | "lister"
}) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const [active, setActive] = React.useState<ActionDef | null>(null)
  const [value, setValue] = React.useState<Value>({})
  const attendees = useAttendees(active?.input === "attendee")
  const run = useAction(
    ({ def, v }: { def: ActionDef; v: Value }) => def.run(inspection, v),
    {
      success: "Done.",
      invalidate: [queryKeys.inspections, queryKeys.lister.inspections],
      onSuccess: () => {
        setActive(null)
        setValue({})
      },
    }
  )

  const all = side === "customer" ? customerActions : listerActions
  const entries = all
    .map((def) => ({ def, a: availability(side, def.key, inspection, now) }))
    .filter(
      (e): e is { def: ActionDef; a: NonNullable<Availability> } => e.a !== null
    )
  if (
    entries.length === 0 ||
    (TERMINAL.includes(inspection.status) &&
      !entries.some((e) => e.def.key === "outcome"))
  )
    return null
  const main = entries.filter((e) => !e.def.destructive)
  const danger = entries.filter((e) => e.def.destructive)
  const primary = PRIMARY[side]
    .map((key) => entries.find((e) => e.def.key === key))
    .find((e) => e?.a.state === "ready")?.def

  const choose = (def: ActionDef) =>
    def.input === "none"
      ? run.mutate({ def, v: {} })
      : (setValue(def.input === "minutes" ? { minutes: 30 } : {}),
        setActive(def))
  const ready = () => {
    switch (active?.input) {
      case "slot":
        return Boolean(value.slot)
      case "time":
        return isBookableTime(value.time)
      case "reason":
        return (value.reason?.trim().length ?? 0) >= 3
      case "minutes":
        return Boolean(value.minutes)
      case "yesno":
        return value.accept !== undefined
      case "outcome":
        return Boolean(value.outcome)
      case "attendee":
        return Boolean(value.attendeeId?.trim())
      default:
        return true
    }
  }

  return (
    <>
      {primary ? (
        <Button
          disabled={run.isPending}
          onClick={() => choose(primary)}
          className="animate-in zoom-in-95 fade-in sm:flex-none"
        >
          {run.isPending && run.variables?.def.key === primary.key ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            (() => {
              const Icon = ICONS[primary.key]
              return Icon ? <Icon /> : null
            })()
          )}
          {primary.label}
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="group sm:flex-none">
            Manage viewing
            <span className="grid min-w-5 place-items-center rounded-full bg-muted px-1.5 text-[11px] leading-5 font-semibold tabular-nums">
              {entries.length}
            </span>
            <ChevronDown className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-1.5">
          <DropdownMenuLabel className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            What would you like to do?
          </DropdownMenuLabel>
          {main.map((e, i) => (
            <ActionItem
              key={e.def.key}
              entry={e}
              index={i}
              onChoose={() => choose(e.def)}
            />
          ))}
          {danger.length ? (
            <>
              <DropdownMenuSeparator />
              {danger.map((e, i) => (
                <ActionItem
                  key={e.def.key}
                  entry={e}
                  index={main.length + i}
                  onChoose={() => choose(e.def)}
                />
              ))}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => !open && setActive(null)}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{active?.label}</DialogTitle>
            <DialogDescription>
              {active?.description ?? inspection.listing?.title ?? "Viewing"}
            </DialogDescription>
          </DialogHeader>

          {active?.input === "slot" ? (
            <SlotPicker
              listingId={inspection.listing?.id ?? inspection.listingId ?? ""}
              value={value.slot ?? null}
              onChange={(slot) => setValue({ slot })}
            />
          ) : null}
          {active?.input === "time" ? (
            <DateTimePicker
              value={value.time ?? ""}
              onChange={(time) => setValue({ time })}
            />
          ) : null}
          {active?.input === "reason" ||
          active?.input === "outcome" ||
          active?.input === "complete" ? (
            <>
              {active.input === "outcome" ? (
                <div
                  role="radiogroup"
                  aria-label="Outcome"
                  className="flex flex-wrap gap-2"
                >
                  {(
                    [
                      ["PROCEED", "I want to proceed"],
                      ["NOT_INTERESTED", "Not interested"],
                      ["NEED_MORE_TIME", "Need more time"],
                    ] as const
                  ).map(([v, label]) => (
                    <Choice
                      key={v}
                      on={value.outcome === v}
                      onClick={() => setValue({ ...value, outcome: v })}
                    >
                      {label}
                    </Choice>
                  ))}
                </div>
              ) : null}
              {active.input === "complete" ? (
                <div
                  role="radiogroup"
                  aria-label="Did the customer attend?"
                  className="flex gap-2"
                >
                  <Choice
                    on={value.attended === true}
                    onClick={() => setValue({ ...value, attended: true })}
                  >
                    Customer attended
                  </Choice>
                  <Choice
                    on={value.attended === false}
                    onClick={() => setValue({ ...value, attended: false })}
                  >
                    Didn&apos;t attend
                  </Choice>
                </div>
              ) : null}
              <Textarea
                rows={3}
                aria-label={
                  active.input === "reason" ? "Reason" : "Note (optional)"
                }
                placeholder={
                  active.input === "reason"
                    ? "Tell us why"
                    : "Add a note (optional)"
                }
                value={value.reason ?? ""}
                onChange={(e) => setValue({ ...value, reason: e.target.value })}
              />
            </>
          ) : null}
          {active?.input === "minutes" ? (
            <div className="flex flex-col gap-2">
              <AdaptiveStepper
                label="extra time"
                value={value.minutes ?? 30}
                min={30}
                max={180}
                step={30}
                format={(m) => `+${m} min`}
                onValueChange={(minutes) => setValue({ minutes })}
              />
              <p className="text-center text-xs text-muted-foreground">
                Extensions go up in 30-minute steps, to 3 hours in total.
              </p>
            </div>
          ) : null}
          {active?.input === "yesno" ? (
            <div role="radiogroup" aria-label="Answer" className="flex gap-2">
              <Choice
                on={value.accept === true}
                onClick={() => setValue({ accept: true })}
              >
                Accept
              </Choice>
              <Choice
                on={value.accept === false}
                onClick={() => setValue({ accept: false })}
              >
                Decline
              </Choice>
            </div>
          ) : null}
          {active?.input === "attendee" ? (
            <FormSelect
              aria-label="Who attends"
              placeholder={
                attendees.isPending ? "Loading team…" : "Choose who attends"
              }
              value={value.attendeeId ?? ""}
              onChange={(e) => setValue({ attendeeId: e.target.value })}
              options={attendees.options}
            />
          ) : null}

          <DialogFooter>
            <Button
              variant={active?.destructive ? "destructive" : "default"}
              disabled={!ready() || run.isPending}
              onClick={() => active && run.mutate({ def: active, v: value })}
            >
              {run.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
