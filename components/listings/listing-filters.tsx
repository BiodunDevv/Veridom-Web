"use client"

import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import {
  useAmenities,
  useLocations,
  usePropertyTypes,
} from "@/features/catalog/hooks"
import { countFilters, type ListingFilters } from "@/features/listings/filters"
import type { PropertyType } from "@/lib/api/catalog"
import { cn } from "@/lib/utils"

const flattenTypes = (types: PropertyType[] = []) =>
  types.flatMap((type) =>
    type.children?.length
      ? type.children.map((child) => ({
          value: child.id,
          label: `${type.name} · ${child.name}`,
        }))
      : [{ value: type.id, label: type.name }]
  )

const bedroomOptions = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: `${n}+ bedrooms`,
}))
const furnishingOptions = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FURNISHED", label: "Furnished" },
]
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
]

const fieldClass =
  "h-12 w-full rounded-lg border border-input bg-background px-4 text-sm font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function ListingFilterBar({
  filters,
  onChange,
}: {
  filters: ListingFilters
  onChange: (next: ListingFilters) => void
}) {
  const [more, setMore] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const types = usePropertyTypes().data
  const states = useLocations().data
  const lgas = useLocations(filters.stateId, Boolean(filters.stateId)).data
  const areas = useLocations(filters.lgaId, Boolean(filters.lgaId)).data
  const clusters = useAmenities().data

  const set = (patch: Partial<ListingFilters>) =>
    onChange({ ...filters, ...patch })
  const pick = (value: string) => value || undefined
  const toNum = (value: string) =>
    value === "" || Number.isNaN(Number(value)) ? undefined : Number(value)

  const toggleAmenity = (id: string) => {
    const current = filters.amenityIds ?? []
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id].slice(0, 10)
    set({ amenityIds: next.length ? next : undefined })
  }

  // Text and price inputs are uncontrolled; they apply on submit or blur.
  const applyText = () => {
    const data = new FormData(formRef.current ?? undefined)
    set({
      q: String(data.get("q") ?? "").trim() || undefined,
      minPrice: toNum(String(data.get("min") ?? "")),
      maxPrice: toNum(String(data.get("max") ?? "")),
    })
  }
  const active = countFilters(filters)

  return (
    <form
      ref={formRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        applyText()
      }}
      className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-xl sm:p-4"
    >
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search properties</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            key={`q-${filters.q ?? ""}`}
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search by title or description"
            minLength={2}
            maxLength={100}
            className={cn(fieldClass, "pl-11")}
          />
        </label>
        <Button type="submit" size="lg" className="h-12 shrink-0">
          Search
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <FormSelect
          aria-label="Rent or sale"
          placeholder="Rent or sale"
          value={filters.listingType ?? ""}
          onChange={(e) =>
            set({
              listingType: pick(
                e.target.value
              ) as ListingFilters["listingType"],
            })
          }
          options={[
            { value: "RENT", label: "For rent" },
            { value: "SALE", label: "For sale" },
          ]}
        />
        <FormSelect
          aria-label="State"
          placeholder="State"
          value={filters.stateId ?? ""}
          onChange={(e) =>
            set({
              stateId: pick(e.target.value),
              lgaId: undefined,
              areaId: undefined,
            })
          }
          options={(states ?? []).map((s) => ({ value: s.id, label: s.name }))}
        />
        <FormSelect
          aria-label="Local government area"
          placeholder="Area (LGA)"
          disabled={!filters.stateId}
          value={filters.lgaId ?? ""}
          onChange={(e) =>
            set({ lgaId: pick(e.target.value), areaId: undefined })
          }
          options={(lgas ?? []).map((l) => ({ value: l.id, label: l.name }))}
        />
        <FormSelect
          aria-label="Neighbourhood"
          placeholder="Neighbourhood"
          disabled={!filters.lgaId || !areas?.length}
          value={filters.areaId ?? ""}
          onChange={(e) => set({ areaId: pick(e.target.value) })}
          options={(areas ?? []).map((a) => ({ value: a.id, label: a.name }))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={more}
          onClick={() => setMore((v) => !v)}
        >
          <SlidersHorizontal /> {more ? "Fewer filters" : "More filters"}
        </Button>
        <div className="flex items-center gap-2">
          <FormSelect
            aria-label="Sort"
            placeholder="Sort"
            value={filters.sort ?? ""}
            onChange={(e) =>
              set({ sort: pick(e.target.value) as ListingFilters["sort"] })
            }
            options={sortOptions}
            wrapperClassName="w-48"
            className="h-9"
          />
          {active > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({})}
            >
              <X /> Clear ({active})
            </Button>
          ) : null}
        </div>
      </div>

      {more ? (
        <div className="grid gap-4 border-t pt-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <FormSelect
              aria-label="Property type"
              placeholder="Property type"
              value={filters.propertyTypeId ?? ""}
              onChange={(e) => set({ propertyTypeId: pick(e.target.value) })}
              options={flattenTypes(types)}
            />
            <FormSelect
              aria-label="Bedrooms"
              placeholder="Bedrooms"
              value={filters.minBedrooms?.toString() ?? ""}
              onChange={(e) => set({ minBedrooms: toNum(e.target.value) })}
              options={bedroomOptions}
            />
            <input
              key={`min-${filters.minPrice ?? ""}`}
              name="min"
              inputMode="numeric"
              aria-label="Minimum price in naira"
              placeholder="Min price (₦)"
              defaultValue={filters.minPrice}
              onBlur={applyText}
              className={fieldClass}
            />
            <input
              key={`max-${filters.maxPrice ?? ""}`}
              name="max"
              inputMode="numeric"
              aria-label="Maximum price in naira"
              placeholder="Max price (₦)"
              defaultValue={filters.maxPrice}
              onBlur={applyText}
              className={fieldClass}
            />
            <FormSelect
              aria-label="Furnishing"
              placeholder="Furnishing"
              value={filters.furnishing ?? ""}
              onChange={(e) =>
                set({
                  furnishing: pick(
                    e.target.value
                  ) as ListingFilters["furnishing"],
                })
              }
              options={furnishingOptions}
            />
          </div>
          {clusters?.length ? (
            <fieldset className="grid gap-3">
              <legend className="mb-1 text-sm font-semibold">
                Amenities{" "}
                <span className="font-normal text-muted-foreground">
                  (must have all, up to 10)
                </span>
              </legend>
              {clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                    {cluster.name}
                  </span>
                  {cluster.amenities.map((amenity) => {
                    const on = filters.amenityIds?.includes(amenity.id)
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          on
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-accent"
                        )}
                      >
                        {amenity.name}
                      </button>
                    )
                  })}
                </div>
              ))}
            </fieldset>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
