"use client"

import * as React from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Field, inputClass } from "@/components/site/field"
import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import {
  useAmenities,
  useLocations,
  usePropertyTypes,
} from "@/features/catalog/hooks"
import type { FeeInput, ListerListing, ListingInput } from "@/lib/api/lister"
import { cn } from "@/lib/utils"

type DraftFee = {
  feeType: FeeInput["feeType"]
  amount: string
  frequency: FeeInput["frequency"]
  refundable: boolean
}

export type Draft = {
  listingType: "RENT" | "SALE"
  title: string
  description: string
  propertyTypeId: string
  price: string
  rentPeriod: "YEAR" | "MONTH"
  bedrooms: string
  bathrooms: string
  toilets: string
  sizeSqm: string
  furnishing: string
  stateId: string
  lgaId: string
  areaId: string
  addressLine: string
  latitude: string
  longitude: string
  fees: DraftFee[]
  amenityIds: string[]
}

const kobo = (naira: string) => Math.round(Number(naira) * 100)
const toNaira = (value?: number) => (value ? String(value / 100) : "")
const num = (value: string) =>
  value.trim() === "" || Number.isNaN(Number(value)) ? undefined : Number(value)

export const toDraft = (listing?: ListerListing): Draft => ({
  listingType: listing?.listingType ?? "RENT",
  title: listing?.title ?? "",
  description: listing?.description ?? "",
  propertyTypeId: listing?.propertyTypeId ?? "",
  price: toNaira(listing?.priceKobo),
  rentPeriod: listing?.rentPeriod ?? "YEAR",
  bedrooms: listing?.bedrooms?.toString() ?? "",
  bathrooms: listing?.bathrooms?.toString() ?? "",
  toilets: listing?.toilets?.toString() ?? "",
  sizeSqm: listing?.sizeSqm?.toString() ?? "",
  furnishing: listing?.furnishing ?? "",
  stateId: listing?.stateId ?? "",
  lgaId: listing?.lgaId ?? "",
  areaId: listing?.areaId ?? "",
  addressLine: listing?.addressLine ?? "",
  latitude: listing?.latitude?.toString() ?? "",
  longitude: listing?.longitude?.toString() ?? "",
  fees: (listing?.fees ?? []).map((fee) => ({
    feeType: fee.feeType,
    amount: toNaira(fee.amountKobo),
    frequency: fee.frequency,
    refundable: Boolean(fee.refundable),
  })),
  amenityIds: listing?.amenityIds ?? [],
})

/** Sends only documented fields, in kobo; totals are computed by the server. */
export function toInput(d: Draft): ListingInput {
  const rent = d.listingType === "RENT"
  return {
    listingType: d.listingType,
    title: d.title.trim(),
    description: d.description.trim() || undefined,
    propertyTypeId: d.propertyTypeId || undefined,
    priceKobo: d.price ? kobo(d.price) : undefined,
    rentPeriod: rent ? d.rentPeriod : undefined,
    bedrooms: num(d.bedrooms),
    bathrooms: num(d.bathrooms),
    toilets: num(d.toilets),
    sizeSqm: num(d.sizeSqm),
    furnishing: (d.furnishing || undefined) as ListingInput["furnishing"],
    stateId: d.stateId || undefined,
    lgaId: d.lgaId || undefined,
    areaId: d.areaId || undefined,
    addressLine: d.addressLine.trim() || undefined,
    latitude: num(d.latitude),
    longitude: num(d.longitude),
    fees: rent
      ? d.fees
          .filter((f) => f.amount)
          .map((f) => ({
            feeType: f.feeType,
            amountKobo: kobo(f.amount),
            frequency: f.frequency,
            refundable: f.refundable || undefined,
          }))
      : [],
    amenityIds: d.amenityIds,
  }
}

const feeTypes: { value: FeeInput["feeType"]; label: string }[] = [
  { value: "CAUTION_DEPOSIT", label: "Caution deposit" },
  { value: "SERVICE_CHARGE", label: "Service charge" },
  { value: "LEGAL_FEE", label: "Legal fee" },
  { value: "AGREEMENT_FEE", label: "Agreement fee" },
  { value: "OTHER", label: "Other" },
]

function Card({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function ListingForm({
  draft,
  onChange,
  disabled,
  saving,
  onSave,
  isNew,
}: {
  draft: Draft
  onChange: (next: Draft) => void
  disabled?: boolean
  saving?: boolean
  onSave: () => void
  isNew?: boolean
}) {
  const types = usePropertyTypes().data
  const states = useLocations().data
  const lgas = useLocations(
    draft.stateId || undefined,
    Boolean(draft.stateId)
  ).data
  const areas = useLocations(
    draft.lgaId || undefined,
    Boolean(draft.lgaId)
  ).data
  const clusters = useAmenities().data
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch })
  const rent = draft.listingType === "RENT"

  const leafTypes = (types ?? []).flatMap((t) =>
    t.children?.length
      ? t.children.map((c) => ({ value: c.id, label: `${t.name} · ${c.name}` }))
      : []
  )
  const text = (
    key: keyof Draft,
    props: React.ComponentProps<"input"> = {}
  ) => (
    <input
      value={draft[key] as string}
      onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)}
      disabled={disabled}
      className={inputClass}
      {...props}
    />
  )
  const setFee = (index: number, patch: Partial<DraftFee>) =>
    set({
      fees: draft.fees.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    })

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
    >
      <Card title="The basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Listing type">
            <FormSelect
              aria-label="Listing type"
              placeholder="Choose"
              disabled={disabled || !isNew}
              value={draft.listingType}
              onChange={(e) =>
                set({ listingType: e.target.value as Draft["listingType"] })
              }
              options={[
                { value: "RENT", label: "For rent" },
                { value: "SALE", label: "For sale" },
              ]}
            />
          </Field>
          <Field label="Property type">
            <FormSelect
              aria-label="Property type"
              placeholder="Choose a sub-type"
              disabled={disabled}
              value={draft.propertyTypeId}
              onChange={(e) => set({ propertyTypeId: e.target.value })}
              options={leafTypes}
            />
          </Field>
          <Field label="Title" className="sm:col-span-2">
            {text("title", {
              required: true,
              minLength: 5,
              maxLength: 120,
              placeholder: "e.g. Spacious 2 bedroom flat in Lekki",
            })}
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              disabled={disabled}
              rows={5}
              placeholder="At least 20 characters. Describe the space, the neighbourhood and what's included."
              className={cn(inputClass, "h-auto min-h-32 resize-y py-3")}
            />
          </Field>
        </div>
      </Card>

      <Card title="Price" hint="Enter naira. We store and show exact amounts.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={rent ? "Rent per period (₦)" : "Sale price (₦)"}>
            {text("price", { inputMode: "numeric", placeholder: "3500000" })}
          </Field>
          {rent ? (
            <Field label="Rent period">
              <FormSelect
                aria-label="Rent period"
                placeholder="Choose"
                disabled={disabled}
                value={draft.rentPeriod}
                onChange={(e) =>
                  set({ rentPeriod: e.target.value as Draft["rentPeriod"] })
                }
                options={[
                  { value: "YEAR", label: "Per year" },
                  { value: "MONTH", label: "Per month" },
                ]}
              />
            </Field>
          ) : null}
        </div>

        {rent ? (
          <div className="flex flex-col gap-3 border-t pt-4">
            <h3 className="text-sm font-semibold">Fees</h3>
            {draft.fees.map((fee, index) => (
              <div
                key={index}
                className="grid items-end gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
              >
                <FormSelect
                  aria-label="Fee type"
                  placeholder="Fee"
                  disabled={disabled}
                  value={fee.feeType}
                  onChange={(e) =>
                    setFee(index, {
                      feeType: e.target.value as FeeInput["feeType"],
                    })
                  }
                  options={feeTypes}
                />
                <input
                  aria-label="Fee amount in naira"
                  inputMode="numeric"
                  placeholder="Amount (₦)"
                  disabled={disabled}
                  value={fee.amount}
                  onChange={(e) => setFee(index, { amount: e.target.value })}
                  className={inputClass}
                />
                <FormSelect
                  aria-label="Frequency"
                  placeholder="When"
                  disabled={disabled}
                  value={fee.frequency}
                  onChange={(e) =>
                    setFee(index, {
                      frequency: e.target.value as FeeInput["frequency"],
                    })
                  }
                  options={[
                    { value: "FIRST_PAYMENT", label: "First payment" },
                    { value: "RECURRING", label: "Every renewal" },
                  ]}
                />
                <label className="flex h-12 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={fee.refundable}
                    disabled={disabled}
                    onChange={(e) =>
                      setFee(index, { refundable: e.target.checked })
                    }
                    className="size-4 accent-[var(--primary)]"
                  />{" "}
                  Refundable
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove fee"
                  disabled={disabled}
                  onClick={() =>
                    set({ fees: draft.fees.filter((_, i) => i !== index) })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={disabled}
              onClick={() =>
                set({
                  fees: [
                    ...draft.fees,
                    {
                      feeType: "CAUTION_DEPOSIT",
                      amount: "",
                      frequency: "FIRST_PAYMENT",
                      refundable: false,
                    },
                  ],
                })
              }
            >
              <Plus /> Add a fee
            </Button>
          </div>
        ) : null}
      </Card>

      <Card title="Details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Bedrooms">
            {text("bedrooms", { inputMode: "numeric" })}
          </Field>
          <Field label="Bathrooms">
            {text("bathrooms", { inputMode: "numeric" })}
          </Field>
          <Field label="Toilets">
            {text("toilets", { inputMode: "numeric" })}
          </Field>
          <Field label="Size (sqm)">
            {text("sizeSqm", { inputMode: "numeric" })}
          </Field>
          <Field label="Furnishing">
            <FormSelect
              aria-label="Furnishing"
              placeholder="Choose"
              disabled={disabled}
              value={draft.furnishing}
              onChange={(e) => set({ furnishing: e.target.value })}
              options={[
                { value: "UNFURNISHED", label: "Unfurnished" },
                { value: "SEMI_FURNISHED", label: "Semi-furnished" },
                { value: "FURNISHED", label: "Furnished" },
              ]}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Location"
        hint="State, area and neighbourhood must belong together."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="State">
            <FormSelect
              aria-label="State"
              placeholder="Choose"
              disabled={disabled}
              value={draft.stateId}
              onChange={(e) =>
                set({ stateId: e.target.value, lgaId: "", areaId: "" })
              }
              options={(states ?? []).map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </Field>
          <Field label="Area (LGA)">
            <FormSelect
              aria-label="LGA"
              placeholder="Choose"
              disabled={disabled || !draft.stateId}
              value={draft.lgaId}
              onChange={(e) => set({ lgaId: e.target.value, areaId: "" })}
              options={(lgas ?? []).map((l) => ({
                value: l.id,
                label: l.name,
              }))}
            />
          </Field>
          <Field label="Neighbourhood">
            <FormSelect
              aria-label="Neighbourhood"
              placeholder="Choose"
              disabled={disabled || !draft.lgaId}
              value={draft.areaId}
              onChange={(e) => set({ areaId: e.target.value })}
              options={(areas ?? []).map((a) => ({
                value: a.id,
                label: a.name,
              }))}
            />
          </Field>
          <Field label="Street address" className="sm:col-span-3">
            {text("addressLine", { placeholder: "12 Admiralty Way" })}
          </Field>
          <Field label="Latitude (optional)">
            {text("latitude", { inputMode: "decimal", placeholder: "6.45" })}
          </Field>
          <Field label="Longitude (optional)">
            {text("longitude", { inputMode: "decimal", placeholder: "3.47" })}
          </Field>
        </div>
      </Card>

      {clusters?.length ? (
        <Card title="Amenities">
          {clusters.map((cluster) => (
            <fieldset
              key={cluster.id}
              className="flex flex-wrap items-center gap-2"
            >
              <legend className="sr-only">{cluster.name}</legend>
              <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                {cluster.name}
              </span>
              {cluster.amenities.map((amenity) => {
                const on = draft.amenityIds.includes(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    aria-pressed={on}
                    disabled={disabled}
                    onClick={() =>
                      set({
                        amenityIds: on
                          ? draft.amenityIds.filter((id) => id !== amenity.id)
                          : [...draft.amenityIds, amenity.id],
                      })
                    }
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
            </fieldset>
          ))}
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={disabled || saving || draft.title.trim().length < 5}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {isNew ? "Save draft" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
