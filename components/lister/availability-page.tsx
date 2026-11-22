"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Trash2, X } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { RetryState } from "@/components/retry-state"
import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import {
  useAvailability,
  useSaveAvailability,
} from "@/features/lister/ops-hooks"
import { useMembers } from "@/features/lister/org-hooks"
import type { Availability } from "@/lib/api/lister"
import { lagosDate } from "@/lib/format"
import { FormSkeleton } from "@/components/ui/page-skeletons"

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
const defaults: Availability = {
  slotMinutes: 60,
  autoConfirm: false,
  defaultAttendeeId: null,
  blackoutDates: [],
  windows: [1, 2, 3, 4, 5].map((weekday) => ({
    weekday,
    startsAt: "09:00",
    endsAt: "17:00",
  })),
}
const time =
  "h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function Editor({
  listingId,
  initial,
}: {
  listingId: string
  initial: Availability
}) {
  const [value, setValue] = React.useState(initial)
  const save = useSaveAvailability(listingId)
  const members = useMembers(true).data ?? []
  const set = (patch: Partial<Availability>) => setValue({ ...value, ...patch })
  const setWindow = (
    i: number,
    patch: Partial<Availability["windows"][number]>
  ) =>
    set({
      windows: value.windows.map((w, k) => (k === i ? { ...w, ...patch } : w)),
    })

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate(value)
      }}
    >
      <section className="grid gap-4 rounded-xl bg-card p-5 shadow-md sm:grid-cols-2 sm:p-6">
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
            onChange={(e) => set({ defaultAttendeeId: e.target.value || null })}
            options={members.map((m) => ({
              value: m.id,
              label: `${m.firstName} ${m.lastName}`,
            }))}
          />
        </label>
        <label className="flex items-start gap-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={value.autoConfirm}
            onChange={(e) => set({ autoConfirm: e.target.checked })}
            className="mt-1 size-4 accent-[var(--primary)]"
          />
          <span>
            <span className="font-medium">Confirm requests automatically</span>
            <span className="block text-muted-foreground">
              Customers get the address and attendee straight away.
            </span>
          </span>
        </label>
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold">
          Weekly hours{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (Lagos time)
          </span>
        </h2>
        {value.windows.map((w, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <FormSelect
              aria-label="Day"
              placeholder="Day"
              value={String(w.weekday)}
              onChange={(e) =>
                setWindow(i, { weekday: Number(e.target.value) })
              }
              options={DAYS.map((d, n) => ({ value: String(n), label: d }))}
              wrapperClassName="w-40"
            />
            <input
              type="time"
              aria-label="From"
              value={w.startsAt}
              onChange={(e) => setWindow(i, { startsAt: e.target.value })}
              className={time}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="time"
              aria-label="Until"
              value={w.endsAt}
              onChange={(e) => setWindow(i, { endsAt: e.target.value })}
              className={time}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Remove hours"
              onClick={() =>
                set({ windows: value.windows.filter((_, k) => k !== i) })
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="self-start"
          onClick={() =>
            set({
              windows: [
                ...value.windows,
                { weekday: 1, startsAt: "09:00", endsAt: "17:00" },
              ],
            })
          }
        >
          <Plus /> Add hours
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold">Days off</h2>
        <div className="flex flex-wrap gap-2">
          {value.blackoutDates.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm"
            >
              {d}
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={`Remove ${d}`}
                onClick={() =>
                  set({
                    blackoutDates: value.blackoutDates.filter((x) => x !== d),
                  })
                }
              >
                <X />
              </Button>
            </span>
          ))}
        </div>
        <input
          type="date"
          aria-label="Add a day off"
          min={lagosDate(0)}
          className={`${time} w-fit`}
          onChange={(e) => {
            const d = e.target.value
            if (d && !value.blackoutDates.includes(d))
              set({ blackoutDates: [...value.blackoutDates, d].sort() })
            e.target.value = ""
          }}
        />
      </section>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={save.isPending || value.windows.length === 0}
        >
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}{" "}
          Save viewing times
        </Button>
      </div>
    </form>
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
      <PageHeader
        title="Viewing times"
        description="When customers can book a viewing of this listing."
      />
      {query.isPending ? (
        <FormSkeleton fields={3} />
      ) : query.isError ? (
        <RetryState label="viewing times" onRetry={() => query.refetch()} />
      ) : (
        <Editor listingId={id} initial={query.data ?? defaults} />
      )}
    </>
  )
}
