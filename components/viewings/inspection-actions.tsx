"use client"

import * as React from "react"
import { ChevronDown, Loader2 } from "lucide-react"

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
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
const lagosIso = (local: string) => new Date(`${local}:00+01:00`).toISOString()

const customerActions: ActionDef[] = [
  {
    key: "accept",
    label: "Accept new time",
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
    input: "outcome",
    run: (i, v) => inspectionsApi.outcome(i.id, v.outcome!, v.reason),
  },
  {
    key: "cancel",
    label: "Cancel viewing",
    input: "reason",
    destructive: true,
    run: (i, v) => inspectionsApi.cancel(i.id, v.reason!),
  },
]

const listerActions: ActionDef[] = [
  {
    key: "accept",
    label: "Accept",
    input: "none",
    run: (i) => listerApi.acceptInspection(i.id),
  },
  {
    key: "decline",
    label: "Decline",
    input: "reason",
    destructive: true,
    run: (i, v) => listerApi.declineInspection(i.id, v.reason!),
  },
  {
    key: "propose",
    label: "Propose another time",
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
    input: "attendee",
    run: (i, v) => listerApi.reassignInspection(i.id, v.attendeeId!),
  },
  {
    key: "checkin",
    label: "Check in",
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
    input: "none",
    destructive: true,
    run: (i) => listerApi.reportNoShowInspection(i.id),
  },
  {
    key: "complete",
    label: "Mark as complete",
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
    input: "none",
    destructive: true,
    run: (i) => listerApi.cancelInspection(i.id),
  },
]

const TERMINAL = ["CANCELLED", "DECLINED", "COMPLETED", "NO_SHOW", "EXPIRED"]
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

export function InspectionActions({
  inspection,
  side,
}: {
  inspection: Inspection
  side: "customer" | "lister"
}) {
  const [active, setActive] = React.useState<ActionDef | null>(null)
  const [value, setValue] = React.useState<Value>({})
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

  if (TERMINAL.includes(inspection.status)) return null
  const defs = (side === "customer" ? customerActions : listerActions).filter(
    (def) =>
      !(
        side === "customer" &&
        def.key === "accept" &&
        inspection.status !== "PROPOSED"
      )
  )

  const choose = (def: ActionDef) =>
    def.input === "none"
      ? run.mutate({ def, v: {} })
      : (setValue({}), setActive(def))
  const ready = () => {
    switch (active?.input) {
      case "slot":
        return Boolean(value.slot)
      case "time":
        return Boolean(value.time)
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Manage viewing <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {defs.map((def) => (
            <DropdownMenuItem
              key={def.key}
              variant={def.destructive ? "destructive" : "default"}
              onSelect={() => choose(def)}
            >
              {def.label}
            </DropdownMenuItem>
          ))}
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
            <label className="flex flex-col gap-2 text-sm font-medium">
              New date and time (Lagos time)
              <input
                type="datetime-local"
                value={value.time ?? ""}
                onChange={(e) => setValue({ time: e.target.value })}
                className="h-12 rounded-lg border border-input bg-background px-4 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
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
            <div
              role="radiogroup"
              aria-label="Extra time"
              className="flex flex-wrap gap-2"
            >
              {[30, 60, 90, 120, 180].map((m) => (
                <Choice
                  key={m}
                  on={value.minutes === m}
                  onClick={() => setValue({ minutes: m })}
                >
                  +{m} min
                </Choice>
              ))}
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
            <input
              placeholder="Attendee member ID"
              aria-label="Attendee member ID"
              value={value.attendeeId ?? ""}
              onChange={(e) => setValue({ attendeeId: e.target.value })}
              className="h-12 rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
