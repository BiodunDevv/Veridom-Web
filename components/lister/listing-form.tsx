"use client"

import * as React from "react"
import { Check, Loader2, Plus, Trash2 } from "lucide-react"

import dynamic from "next/dynamic"

import { Field, inputClass } from "@/components/site/field"
import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { NeighbourhoodPicker } from "@/components/lister/neighbourhood-picker"
import { Switch } from "@/components/ui/switch"
import { formatNaira } from "@/lib/format"
import {
  useAmenities,
  useLocations,
  usePropertyTypes,
} from "@/features/catalog/hooks"
import { useMembers, usePermissions } from "@/features/lister/org-hooks"
import type { AreaFocus } from "@/components/map/location-picker"
import type { FeeInput, ListerListing, ListingInput } from "@/lib/api/lister"
import { cn } from "@/lib/utils"

const LocationPicker = dynamic(
  () =>
    import("@/components/map/location-picker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[22rem] w-full animate-pulse rounded-2xl bg-muted" />
    ),
  }
)

export type Section = "basics" | "price" | "details" | "location" | "amenities"

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
  /** User id of the teammate in charge. Left undefined unless the person may assign. */
  assignedTo?: string | null
  /** True once the person changed it, so it is only sent when meant. */
  assignedDirty?: boolean
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
  assignedTo: listing?.assignedTo ?? undefined,
  assignedDirty: false,
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
    ...(d.assignedDirty ? { assignedTo: d.assignedTo ?? null } : {}),
  }
}

const feeTypes: { value: FeeInput["feeType"]; label: string }[] = [
  { value: "CAUTION_DEPOSIT", label: "Caution deposit" },
  { value: "SERVICE_CHARGE", label: "Service charge" },
  { value: "LEGAL_FEE", label: "Legal fee" },
  { value: "AGREEMENT_FEE", label: "Agreement fee" },
  { value: "OTHER", label: "Other" },
]

/** Keep digits and at most one decimal point with two places (kobo). */
const cleanMoney = (raw: string) => {
  const [whole, ...rest] = raw.replace(/[^\d.]/g, "").split(".")
  const cents = rest.join("").slice(0, 2)
  const head = whole.replace(/^0+(?=\d)/, "").slice(0, 12)
  return rest.length ? `${head || "0"}.${cents}` : head
}

const showMoney = (clean: string) => {
  const [whole, cents] = clean.split(".")
  const head = whole ? Number(whole).toLocaleString("en-NG") : ""
  return cents === undefined ? head : `${head || "0"}.${cents}`
}

/** Naira field: a \u20A6 prefix, thousands separators while you type, kobo allowed. */
function MoneyInput({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <InputGroup className="h-12 rounded-lg bg-background">
      <InputGroupAddon align="inline-start" className="pl-3.5">
        <span className="text-base font-semibold text-muted-foreground">
          {"\u20A6"}
        </span>
      </InputGroupAddon>
      <InputGroupInput
        inputMode="decimal"
        autoComplete="off"
        value={showMoney(cleanMoney(value))}
        onChange={(e) => onChange(cleanMoney(e.target.value))}
        className="h-full text-base md:text-base"
        {...props}
      />
    </InputGroup>
  )
}

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
  only,
  hideSave,
  hideListingType,
}: {
  draft: Draft
  onChange: (next: Draft) => void
  disabled?: boolean
  saving?: boolean
  onSave: () => void
  isNew?: boolean
  only?: Section[]
  hideSave?: boolean
  hideListingType?: boolean
}) {
  const show = (key: Section) => !only || only.includes(key)
  const types = usePropertyTypes().data
  const states = useLocations().data
  const lgas = useLocations(
    draft.stateId || undefined,
    Boolean(draft.stateId)
  ).data
  const [pinNeighbourhood, setPinNeighbourhood] = React.useState("")
  const areasQuery = useLocations(
    draft.lgaId || undefined,
    Boolean(draft.lgaId)
  )
  const areas = areasQuery.data
  const clusters = useAmenities().data
  // What the map should show for the State / LGA / Neighbourhood selected.
  const areaFocus = React.useMemo<AreaFocus | null>(() => {
    const find = (list: unknown, id: string) =>
      Array.isArray(list)
        ? (list as { id: string; name: string }[]).find((x) => x.id === id)
        : undefined
    const state = find(states, draft.stateId)
    if (!state) return null
    const stateName = /abuja|federal capital|fct/i.test(state.name)
      ? "Abuja"
      : `${state.name.replace(/\s+state$/i, "")} State`
    const lga = find(lgas, draft.lgaId)
    const area = find(areas, draft.areaId)
    if (lga && area)
      return {
        level: "neighbourhood",
        label: area.name,
        query: `${area.name}, ${lga.name}, ${stateName}`,
      }
    if (lga)
      return {
        level: "lga",
        label: lga.name,
        query: `${lga.name}, ${stateName}`,
      }
    return { level: "state", label: stateName, query: `${stateName}, Nigeria` }
  }, [states, lgas, areas, draft.stateId, draft.lgaId, draft.areaId])
  const { can } = usePermissions()
  const canAssign =
    can("listing:update:any") && can("member:manage", "member:invite")
  const members = useMembers(canAssign && show("basics")).data
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
  const rentNaira = Number(draft.price) || 0
  const feeNaira = (when: DraftFee["frequency"]) =>
    draft.fees
      .filter((f) => f.frequency === when)
      .reduce((n, f) => n + (Number(f.amount) || 0), 0)
  const moveInNaira =
    rentNaira + feeNaira("FIRST_PAYMENT") + feeNaira("RECURRING")
  const renewalNaira = rentNaira + feeNaira("RECURRING")
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
      {show("basics") ? (
        <Card title="The basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Listing type"
              className={hideListingType ? "hidden" : undefined}
            >
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
            {canAssign ? (
              <Field label="Assigned to" className="sm:col-span-2">
                <FormSelect
                  aria-label="Assigned to"
                  placeholder="Nobody yet"
                  disabled={disabled}
                  value={draft.assignedTo ?? ""}
                  onChange={(e) =>
                    set({
                      assignedTo: e.target.value || null,
                      assignedDirty: true,
                    })
                  }
                  options={[
                    { value: "", label: "Nobody (any teammate can edit)" },
                    ...(Array.isArray(members) ? members : [])
                      .filter((m) => m.status === "ACTIVE")
                      .map((m) => ({
                        value: m.userId,
                        label: `${m.firstName} ${m.lastName} · ${m.roleName}`,
                      })),
                  ]}
                />
              </Field>
            ) : null}
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
      ) : null}

      {show("price") ? (
        <Card
          title="Price"
          hint="Enter naira. We store and show exact amounts."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={rent ? "Rent per period" : "Sale price"}>
              <MoneyInput
                value={draft.price}
                onChange={(price) => set({ price })}
                disabled={disabled}
                placeholder="3,500,000"
                aria-label={
                  rent ? "Rent per period in naira" : "Sale price in naira"
                }
              />
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
            <div className="flex flex-col gap-4 border-t pt-5">
              <div>
                <h3 className="text-base font-semibold">Fees</h3>
                <p className="text-sm text-muted-foreground">
                  Extra charges renters pay on top of the rent.
                </p>
              </div>

              {draft.fees.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
                  No extra fees. Add a caution deposit, service charge or legal
                  fee below.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {draft.fees.map((fee, index) => (
                    <li
                      key={index}
                      className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3.5 sm:p-4"
                    >
                      <div className="flex items-start gap-2">
                        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
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
                          <MoneyInput
                            value={fee.amount}
                            onChange={(amount) => setFee(index, { amount })}
                            disabled={disabled}
                            placeholder="Amount"
                            aria-label="Fee amount in naira"
                          />
                          <FormSelect
                            aria-label="Frequency"
                            placeholder="When"
                            disabled={disabled}
                            value={fee.frequency}
                            onChange={(e) =>
                              setFee(index, {
                                frequency: e.target
                                  .value as FeeInput["frequency"],
                              })
                            }
                            options={[
                              {
                                value: "FIRST_PAYMENT",
                                label: "First payment",
                              },
                              { value: "RECURRING", label: "Every renewal" },
                            ]}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label="Remove fee"
                          disabled={disabled}
                          onClick={() =>
                            set({
                              fees: draft.fees.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm">
                        <Switch
                          checked={fee.refundable}
                          disabled={disabled}
                          onCheckedChange={(refundable) =>
                            setFee(index, { refundable })
                          }
                        />
                        Refundable
                        <span className="text-xs text-muted-foreground">
                          {fee.refundable
                            ? "Returned to the renter"
                            : "Not returned"}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2" aria-label="Add a fee">
                {feeTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={disabled}
                    onClick={() =>
                      set({
                        fees: [
                          ...draft.fees,
                          {
                            feeType: type.value,
                            amount: "",
                            frequency:
                              type.value === "SERVICE_CHARGE"
                                ? "RECURRING"
                                : "FIRST_PAYMENT",
                            refundable: type.value === "CAUTION_DEPOSIT",
                          },
                        ],
                      })
                    }
                  >
                    <Plus /> {type.label}
                  </Button>
                ))}
              </div>

              {rentNaira > 0 ? (
                <dl className="grid gap-px overflow-hidden rounded-xl border bg-border text-sm sm:grid-cols-2">
                  <div className="flex flex-col gap-0.5 bg-card p-3.5">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Estimated move-in total
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums">
                      {formatNaira(moveInNaira * 100)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 bg-card p-3.5">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Estimated renewal
                    </dt>
                    <dd className="text-lg font-semibold tabular-nums">
                      {formatNaira(renewalNaira * 100)}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}

      {show("details") ? (
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
      ) : null}

      {show("location") ? (
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
              <NeighbourhoodPicker
                lgaId={draft.lgaId || undefined}
                lgaName={lgas?.find((l) => l.id === draft.lgaId)?.name}
                stateName={states?.find((x) => x.id === draft.stateId)?.name}
                value={draft.areaId}
                onChange={(areaId) => set({ areaId })}
                suggestion={pinNeighbourhood}
                disabled={disabled}
              />
            </Field>
            <Field label="Street address" className="sm:col-span-3">
              {text("addressLine", { placeholder: "12 Admiralty Way" })}
            </Field>
            <div className="flex flex-col gap-2 sm:col-span-3">
              <p className="text-base font-semibold">Pin on the map</p>
              <LocationPicker
                focus={areaFocus}
                lat={num(draft.latitude)}
                lng={num(draft.longitude)}
                disabled={disabled}
                onChange={(la, ln) =>
                  set({
                    latitude: la === null ? "" : String(la),
                    longitude: ln === null ? "" : String(ln),
                  })
                }
                onUseAddress={(address) => set({ addressLine: address })}
                onNeighbourhood={setPinNeighbourhood}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {show("amenities") && clusters?.length ? (
        <Card
          title="Amenities"
          hint={
            draft.amenityIds.length
              ? `${draft.amenityIds.length} selected`
              : "Tap everything the property has."
          }
        >
          <div className="flex flex-col divide-y">
            {clusters.map((cluster) => {
              const picked = cluster.amenities.filter((a) =>
                draft.amenityIds.includes(a.id)
              ).length
              return (
                <fieldset
                  key={cluster.id}
                  className="flex min-w-0 flex-col gap-2.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-6"
                >
                  <legend className="sr-only">{cluster.name}</legend>
                  <span className="flex items-center justify-between gap-2 sm:w-36 sm:shrink-0 sm:pt-1.5">
                    <span className="text-sm font-semibold sm:text-xs sm:font-medium sm:text-muted-foreground">
                      {cluster.name}
                    </span>
                    {picked ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
                        {picked}/{cluster.amenities.length}
                      </span>
                    ) : null}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap gap-2">
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
                                ? draft.amenityIds.filter(
                                    (id) => id !== amenity.id
                                  )
                                : [...draft.amenityIds, amenity.id],
                            })
                          }
                          className={cn(
                            "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-[background-color,border-color,color,transform] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:opacity-50 sm:min-h-9",
                            on
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input hover:bg-accent"
                          )}
                        >
                          {on ? (
                            <Check className="size-3.5" aria-hidden />
                          ) : null}
                          {amenity.name}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )
            })}
          </div>
        </Card>
      ) : null}

      <div className={cn("flex justify-end", hideSave && "hidden")}>
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
