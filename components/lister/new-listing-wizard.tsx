"use client"

import * as React from "react"
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Bath,
  Building2,
  Check,
  CircleCheck,
  Circle,
  Loader2,
  MapPin,
} from "lucide-react"

import {
  ListingForm,
  type Draft,
  type Section,
} from "@/components/lister/listing-form"
import { Button } from "@/components/ui/button"
import { PatternBg } from "@/components/ui/pattern-bg"
import { useLocations } from "@/features/catalog/hooks"
import { formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

const steps: { key: Section; label: string; hint: string }[] = [
  { key: "basics", label: "Basics", hint: "What is it?" },
  { key: "price", label: "Price", hint: "Rent or sale" },
  { key: "details", label: "Details", hint: "Rooms and size" },
  { key: "location", label: "Location", hint: "Where is it?" },
  { key: "amenities", label: "Amenities", hint: "What's included" },
]

const furnishingLabel: Record<string, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FURNISHED: "Furnished",
}

/** Items the API needs before a listing can be submitted for review. */
function checklist(d: Draft) {
  const rent = d.listingType === "RENT"
  return [
    { label: "A title", done: d.title.trim().length >= 5 },
    {
      label: "A description of 20+ characters",
      done: d.description.trim().length >= 20,
    },
    { label: "A property type", done: Boolean(d.propertyTypeId) },
    {
      label: rent ? "Rent and period" : "Sale price",
      done: Boolean(d.price) && (!rent || Boolean(d.rentPeriod)),
    },
    { label: "State and area", done: Boolean(d.stateId && d.lgaId) },
    { label: "Street address", done: d.addressLine.trim().length > 0 },
  ]
}

function Preview({ draft }: { draft: Draft }) {
  const states = useLocations().data
  const lgas = useLocations(
    draft.stateId || undefined,
    Boolean(draft.stateId)
  ).data
  const areas = useLocations(
    draft.lgaId || undefined,
    Boolean(draft.lgaId)
  ).data
  const place = [
    areas?.find((a) => a.id === draft.areaId)?.name,
    lgas?.find((l) => l.id === draft.lgaId)?.name,
    states?.find((s) => s.id === draft.stateId)?.name,
  ]
    .filter(Boolean)
    .join(", ")
  const rent = draft.listingType === "RENT"
  const price = draft.price
    ? formatNaira(Math.round(Number(draft.price) * 100))
    : null

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-md">
      <div className="relative isolate grid h-36 place-items-center overflow-hidden rounded-xl bg-secondary">
        <PatternBg className="-z-10 opacity-60 dark:opacity-70" />
        <span className="grid size-14 place-items-center rounded-2xl bg-background/80 text-primary shadow-sm backdrop-blur-sm">
          <Building2 className="size-7" />
        </span>
        <span className="absolute top-2.5 left-2.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {rent ? "For rent" : "For sale"}
        </span>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3
          className={cn(
            "line-clamp-2 text-base font-semibold",
            !draft.title && "text-muted-foreground"
          )}
        >
          {draft.title || "Your title appears here"}
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{place || "Location"}</span>
        </p>
      </div>
      <ul className="flex flex-wrap gap-1.5 px-1 text-xs font-medium">
        {draft.bedrooms ? (
          <li className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <BedDouble className="size-3.5" /> {draft.bedrooms} bed
          </li>
        ) : null}
        {draft.bathrooms ? (
          <li className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <Bath className="size-3.5" /> {draft.bathrooms} bath
          </li>
        ) : null}
        {draft.furnishing ? (
          <li className="rounded-full bg-secondary px-2.5 py-1">
            {furnishingLabel[draft.furnishing]}
          </li>
        ) : null}
      </ul>
      <p className="px-1 pb-1 text-lg font-semibold text-primary">
        {price ?? "₦ —"}
        {price && rent ? (
          <span className="text-sm font-medium text-muted-foreground">
            {" "}
            / {draft.rentPeriod === "MONTH" ? "month" : "year"}
          </span>
        ) : null}
      </p>
    </article>
  )
}

/** Step by step new listing with a live preview and a submit checklist. */
export function NewListingWizard({
  draft,
  onChange,
  saving,
  onCreate,
}: {
  draft: Draft
  onChange: (next: Draft) => void
  saving: boolean
  onCreate: () => void
}) {
  const [index, setIndex] = React.useState(0)
  const [reached, setReached] = React.useState(0)
  const step = steps[index]
  const last = index === steps.length - 1
  const items = checklist(draft)
  const doneCount = items.filter((i) => i.done).length
  const canNext = index !== 0 || draft.title.trim().length >= 5

  const go = (to: number) => {
    setIndex(to)
    setReached((r) => Math.max(r, to))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const next = () => (last ? onCreate() : canNext && go(index + 1))

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
        <nav
          aria-label="Listing steps"
          className="rounded-2xl bg-card p-3 shadow-md sm:p-4"
        >
          <ol className="flex items-center gap-1 overflow-x-auto sm:gap-2">
            {steps.map((s, i) => {
              const active = i === index
              const done = i < index
              return (
                <li
                  key={s.key}
                  className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2"
                >
                  <button
                    type="button"
                    disabled={i > reached}
                    onClick={() => go(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
                      active
                        ? "bg-primary/10"
                        : i <= reached && "hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors",
                        active || done
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {done ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className="hidden min-w-0 flex-col leading-tight md:flex">
                      <span
                        className={cn(
                          "truncate text-sm font-semibold",
                          !active && !done && "text-muted-foreground"
                        )}
                      >
                        {s.label}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {s.hint}
                      </span>
                    </span>
                  </button>
                  {i < steps.length - 1 ? (
                    <span
                      className={cn(
                        "hidden h-px w-3 shrink-0 sm:block lg:w-6",
                        i < index ? "bg-primary" : "bg-border"
                      )}
                    />
                  ) : null}
                </li>
              )
            })}
          </ol>
          <p className="mt-2 px-2 text-xs font-medium text-muted-foreground md:hidden">
            Step {index + 1} of {steps.length}: {step.label}
          </p>
        </nav>

        <div
          key={step.key}
          className="animate-in duration-300 fade-in-0 slide-in-from-right-4"
        >
          <ListingForm
            isNew
            draft={draft}
            onChange={onChange}
            only={[step.key]}
            hideSave
            onSave={next}
          />
        </div>

        <div className="flex items-center gap-3 pt-1 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={cn(index === 0 && "invisible")}
            disabled={index === 0 || saving}
            onClick={() => go(index - 1)}
          >
            <ArrowLeft /> Back
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1 sm:flex-none"
            disabled={
              !canNext || saving || (last && draft.title.trim().length < 5)
            }
            onClick={next}
          >
            {saving ? <Loader2 className="animate-spin" /> : null}
            {last ? "Save draft and add photos" : "Continue"}
            {!last && !saving ? <ArrowRight /> : null}
          </Button>
        </div>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            How renters will see it
          </p>
          <Preview draft={draft} />
        </div>
        <section className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Ready to submit</h2>
            <span className="text-xs font-semibold text-primary">
              {doneCount}/{items.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  item.done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.done ? (
                  <CircleCheck className="size-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="size-4 shrink-0" />
                )}
                {item.label}
              </li>
            ))}
          </ul>
          <p className="border-t pt-3 text-xs text-muted-foreground">
            Photos (at least 3) and a proof document come next, once the draft
            is saved.
          </p>
        </section>
      </aside>
    </div>
  )
}
