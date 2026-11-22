export type ListingSort = "newest" | "price_asc" | "price_desc"

/** Prices are naira in the URL and UI; the API wants kobo. */
export type ListingFilters = {
  q?: string
  listingType?: "RENT" | "SALE"
  stateId?: string
  lgaId?: string
  areaId?: string
  propertyTypeId?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  furnishing?: "UNFURNISHED" | "SEMI_FURNISHED" | "FURNISHED"
  amenityIds?: string[]
  sort?: ListingSort
}

type Params = { get(name: string): string | null }

const num = (value: string | null) => {
  const parsed = value ? Number(value) : NaN
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export function parseFilters(params: Params): ListingFilters {
  const type = params.get("listingType")
  const furnishing = params.get("furnishing")
  const sort = params.get("sort")
  const amenities = params
    .get("amenityIds")
    ?.split(",")
    .filter(Boolean)
    .slice(0, 10)

  return {
    q: params.get("q")?.trim() || undefined,
    listingType: type === "RENT" || type === "SALE" ? type : undefined,
    stateId: params.get("stateId") || undefined,
    lgaId: params.get("lgaId") || undefined,
    areaId: params.get("areaId") || undefined,
    propertyTypeId: params.get("propertyTypeId") || undefined,
    minPrice: num(params.get("minPrice")),
    maxPrice: num(params.get("maxPrice")),
    minBedrooms: num(params.get("minBedrooms")),
    furnishing:
      furnishing === "UNFURNISHED" ||
      furnishing === "SEMI_FURNISHED" ||
      furnishing === "FURNISHED"
        ? furnishing
        : undefined,
    amenityIds: amenities?.length ? amenities : undefined,
    sort: sort === "price_asc" || sort === "price_desc" ? sort : undefined,
  }
}

export function toSearchParams(filters: ListingFilters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    )
      continue
    params.set(key, Array.isArray(value) ? value.join(",") : String(value))
  }
  return params
}

export function toApiQuery(
  filters: ListingFilters,
  extra: { cursor?: string; limit?: number }
) {
  const { minPrice, maxPrice, ...rest } = filters
  const params = toSearchParams(rest)
  if (minPrice !== undefined)
    params.set("minPrice", String(Math.round(minPrice * 100)))
  if (maxPrice !== undefined)
    params.set("maxPrice", String(Math.round(maxPrice * 100)))
  if (extra.limit) params.set("limit", String(extra.limit))
  if (extra.cursor) params.set("cursor", extra.cursor)
  return params.toString()
}

export const countFilters = (filters: ListingFilters) =>
  Array.from(toSearchParams(filters).keys()).length
