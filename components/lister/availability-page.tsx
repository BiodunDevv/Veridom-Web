"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarClock,
  CalendarOff,
  CalendarPlus,
  Clock,
  Eye,
  Hourglass,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react"

import { DaysOffPicker } from "@/components/lister/days-off-picker"
import { ListerHero } from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import { FormSkeleton } from "@/components/ui/page-skeletons"
import { Switch } from "@/components/ui/switch"
import {
  useAvailability,
  useSaveAvailability,
} from "@/features/lister/ops-hooks"
import { useAttendees } from "@/features/lister/org-hooks"
import type { Availability } from "@/lib/api/lister"
import { formatDay, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { previewSlots } from "@/lib/viewing-slots"

type Win = Availability["windows"][number]

/** Monday first, the way people read a week. */
const WEEK = [
  { day: 1, name: "Monday" },
  { day: 2, name: "Tuesday" },
  { day: 3, name: "Wednesday" },
  { day: 4, name: "Thursday" },
  { day: 5, name: "Friday" },
  { day: 6, name: "Saturday" },
  { day: 0, name: "Sunday" },
]

const DEFAULT_HOURS = { startsAt: "09:00", endsAt: "17:00" }

const defaults: Availability = {
  slotMinutes: 60,
  autoConfirm: false,
  defaultAttendeeId: null,
  blackoutDates: [],
  windows: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, ...DEFAULT_HOURS })),
}

const PRESETS: { label: string; days: number[] }[] = [
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Weekends", days: [6, 0] },
]

const timeInput =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (m || 0)
}
const isValid = (w: Win) => minutes(w.endsAt) > minutes(w.startsAt)

/** Whole hours when even, otherwise one decimal: 40 or 37.5. */
const hours = (mins: number) => `${Math.round((mins / 60) * 10) / 10}`

function Section({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <h2 className="font-semibold">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** What customers would be offered right now, updating as the form changes. */
function Preview({ value }: { value: Availability }) {
  const slots = React.useMemo(() => previewSlots(value, 8), [value])
  return (
    <Section
      icon={Eye}
      title="What customers will see"
      description="The next bookable times, updating as you edit."
    >
      <div aria-live="polite">
        {slots.length === 0 ? (
          <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            No bookable times yet. Switch on a day, and remember times must be
            at least 3 hours away and within the next 14 days.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {slots.map((at) => {
                const iso = new Date(at).toISOString()
                return (
                  <span
                    key={at}
                    className="animate-in rounded-lg border border-input px-3 py-2 text-sm fade-in zoom-in-95"
                  >
                    <span className="text-muted-foreground">
                      {formatDay(iso)}
                    </span>{" "}
                    <span className="font-medium">{formatTime(iso)}</span>
                  </span>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Existing viewings and the 30-minute gap between visits are taken
              out when customers book.
            </p>
          </>
        )}
      </div>
    </Section>
  )
}

/** The API returns days off as timestamps but only accepts plain YYYY-MM-DD back. */
const normalise = (av: Availability): Availability => ({
  ...av,
  blackoutDates: [
    ...new Set(
      av.blackoutDates
        .map((d) => /^\d{4}-\d{2}-\d{2}/.exec(d)?.[0])
        .filter((d): d is string => Boolean(d))
    ),
  ].sort(),
})

function Editor({
  listingId,
  initial,
}: {
  listingId: string
  /** null when nothing has been saved yet: the defaults are only a suggestion. */
  initial: Availability | null
}) {
  const [value, setValue] = React.useState(() => normalise(initial ?? defaults))
  const [saved, setSaved] = React.useState<Availability | null>(() =>
    initial ? normalise(initial) : null
  )
  const save = useSaveAvailability(listingId)
  const attendees = useAttendees()

  const set = (patch: Partial<Availability>) =>
    setValue((current) => ({ ...current, ...patch }))

  const dirty = !saved || JSON.stringify(value) !== JSON.stringify(saved)
  const invalid = value.windows.some((w) => !isValid(w))
  const openDays = new Set(value.windows.map((w) => w.weekday))
  const weeklyMinutes = value.windows.reduce(
    (sum, w) => sum + (isValid(w) ? minutes(w.endsAt) - minutes(w.startsAt) : 0),
    0
  )
  const weeklySlots = value.windows.reduce(
    (sum, w) =>
      sum +
      (isValid(w)
        ? Math.floor((minutes(w.endsAt) - minutes(w.startsAt)) / value.slotMinutes)
        : 0),
    0
  )

  const patchWindow = (target: Win, patch: Partial<Win>) =>
    set({ windows: value.windows.map((w) => (w === target ? { ...w, ...patch } : w)) })

  const toggleDay = (day: number, on: boolean) =>
    set({
      windows: on
        ? [...value.windows, { weekday: day, ...DEFAULT_HOURS }]
        : value.windows.filter((w) => w.weekday !== day),
    })

  const applyPreset = (days: number[]) => {
    const template =
      value.windows.find((w) => isValid(w)) ?? { weekday: 1, ...DEFAULT_HOURS }
    set({
      windows: days.map((weekday) => ({
        weekday,
        startsAt: template.startsAt,
        endsAt: template.endsAt,
      })),
    })
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const eligible = attendees.options.some(
      (o) => o.value === value.defaultAttendeeId
    )
    const payload = normalise({
      ...value,
      // Only send an attendee the API will accept (an active member who can run viewings).
      defaultAttendeeId:
        !attendees.isPending && !eligible ? null : value.defaultAttendeeId,
    })
    save.mutate(payload, { onSuccess: () => setSaved(payload) })
  }

  const actions = dirty ? (
    <div className="flex shrink-0 gap-2 animate-in fade-in slide-in-from-bottom-1">
      {saved ? (
        <Button
          type="button"
          variant="outline"
          disabled={save.isPending}
          onClick={() => setValue(saved)}
        >
          Discard
        </Button>
      ) : null}
      <Button
        type="submit"
        form="availability-form"
        disabled={invalid || save.isPending || openDays.size === 0}
      >
        {save.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save />
        )}
        Save viewing times
      </Button>
    </div>
  ) : null

  return (
    <>
      <ListerHero
        icon={CalendarClock}
        eyebrow="Viewings"
        actions={actions}
        title="Viewing times"
        description="Choose when customers can book a visit. Requests only ever land on times you open here."
        stats={[
          {
            label: "Open days",
            value: `${openDays.size} of 7`,
            icon: CalendarPlus,
            tone: openDays.size ? "good" : "warn",
            hint: openDays.size ? "Each week" : "Nothing bookable yet",
          },
          {
            label: "Hours a week",
            value: hours(weeklyMinutes),
            icon: Clock,
            hint: `${weeklySlots} possible visits`,
          },
          {
            label: "Visit length",
            value: `${value.slotMinutes} min`,
            icon: Hourglass,
          },
          {
            label: "Requests",
            value: value.autoConfirm ? "Auto" : "Manual",
            icon: value.autoConfirm ? Zap : ShieldCheck,
            tone: value.autoConfirm ? "good" : "default",
            hint: value.autoConfirm ? "Confirmed instantly" : "You approve each",
          },
        ]}
      />

      <form id="availability-form" className="flex flex-col gap-4" onSubmit={submit}>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <Section
              icon={CalendarClock}
              title="Weekly hours"
              description="Switch on the days you can show this property (Lagos time)."
              action={
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => applyPreset(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    disabled={value.windows.length === 0}
                    onClick={() => set({ windows: [] })}
                  >
                    Clear
                  </Button>
                </div>
              }
            >
              <ul className="flex flex-col gap-2">
                {WEEK.map(({ day, name }) => {
                  const windows = value.windows.filter((w) => w.weekday === day)
                  const on = windows.length > 0
                  return (
                    <li
                      key={day}
                      className={cn(
                        "flex flex-col gap-3 rounded-xl border p-3.5 transition-colors sm:flex-row sm:items-start",
                        on ? "bg-background" : "bg-muted/30"
                      )}
                    >
                      <label className="flex w-40 shrink-0 cursor-pointer items-center gap-3 sm:pt-2">
                        <Switch
                          checked={on}
                          onCheckedChange={(next) => toggleDay(day, next)}
                          aria-label={`${name} viewings`}
                        />
                        <span
                          className={cn(
                            "font-medium",
                            !on && "text-muted-foreground"
                          )}
                        >
                          {name}
                        </span>
                      </label>

                      {on ? (
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          {windows.map((w, i) => (
                            <div
                              key={i}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <input
                                type="time"
                                aria-label={`${name} from`}
                                aria-invalid={!isValid(w)}
                                value={w.startsAt}
                                onChange={(e) =>
                                  patchWindow(w, { startsAt: e.target.value })
                                }
                                className={timeInput}
                              />
                              <span className="text-sm text-muted-foreground">
                                to
                              </span>
                              <input
                                type="time"
                                aria-label={`${name} until`}
                                aria-invalid={!isValid(w)}
                                value={w.endsAt}
                                onChange={(e) =>
                                  patchWindow(w, { endsAt: e.target.value })
                                }
                                className={timeInput}
                              />
                              {windows.length > 1 ? (
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label={`Remove ${name} hours`}
                                  onClick={() =>
                                    set({
                                      windows: value.windows.filter(
                                        (x) => x !== w
                                      ),
                                    })
                                  }
                                >
                                  <Trash2 />
                                </Button>
                              ) : null}
                              {!isValid(w) ? (
                                <span className="text-xs text-destructive">
                                  End must be after start
                                </span>
                              ) : null}
                            </div>
                          ))}
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            className="self-start"
                            onClick={() =>
                              set({
                                windows: [
                                  ...value.windows,
                                  {
                                    weekday: day,
                                    startsAt: "17:00",
                                    endsAt: "19:00",
                                  },
                                ],
                              })
                            }
                          >
                            <Plus /> Add another range
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground sm:pt-2">
                          Closed
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Section>

            <Section
              icon={CalendarOff}
              title="Days off"
              description="Dates when you can't show the property, like holidays."
            >
              <DaysOffPicker
                value={value.blackoutDates}
                onChange={(blackoutDates) => set({ blackoutDates })}
                openWeekdays={openDays}
              />
            </Section>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
            <Section icon={Hourglass} title="Visit settings">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Length of each viewing
                <FormSelect
                  aria-label="Viewing length"
                  placeholder="Choose"
                  value={String(value.slotMinutes)}
                  onChange={(e) =>
                    set({
                      slotMinutes: Number(
                        e.target.value
                      ) as Availability["slotMinutes"],
                    })
                  }
                  options={[45, 60, 90, 120].map((m) => ({
                    value: String(m),
                    label: `${m} minutes`,
                  }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Who attends by default
                <FormSelect
                  aria-label="Default attendee"
                  placeholder="No default"
                  value={value.defaultAttendeeId ?? ""}
                  onChange={(e) =>
                    set({ defaultAttendeeId: e.target.value || null })
                  }
                  options={attendees.options}
                />
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm">
                <Switch
                  checked={value.autoConfirm}
                  onCheckedChange={(next) => set({ autoConfirm: next })}
                  aria-label="Confirm requests automatically"
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">Confirm automatically</span>
                  <span className="block text-muted-foreground">
                    Customers get the address and attendee straight away,
                    without waiting for you.
                  </span>
                </span>
              </label>
            </Section>

            <Preview value={value} />
          </aside>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 pl-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
          <p
            className={cn(
              "flex items-center gap-2 text-sm",
              invalid
                ? "text-destructive"
                : dirty
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                invalid
                  ? "bg-destructive"
                  : dirty
                    ? "bg-amber-500"
                    : openDays.size
                      ? "bg-primary"
                      : "bg-muted-foreground/50"
              )}
            />
            {invalid
              ? "Fix the highlighted hours to save."
              : dirty
                ? saved
                  ? "You have unsaved changes."
                  : "Not saved yet. Customers can't book until you save."
                : openDays.size
                  ? "All changes saved. Customers can book these times."
                  : "No days are open. Switch one on to start taking viewings."}
          </p>
          {actions}
        </div>
      </form>
    </>
  )
}

export function AvailabilityPage({ id }: { id: string }) {
  const query = useAvailability(id)

  return (
    <>
      <Link
        href={`/lister/listings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to listing
      </Link>
      {query.isPending ? (
        <>
          <ListerHero
            icon={CalendarClock}
            eyebrow="Viewings"
            title="Viewing times"
            description="Choose when customers can book a visit."
          />
          <FormSkeleton fields={3} />
        </>
      ) : query.isError ? (
        <RetryState label="viewing times" onRetry={() => query.refetch()} />
      ) : (
        <Editor listingId={id} initial={query.data ?? null} />
      )}
    </>
  )
}
