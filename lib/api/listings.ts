import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"
import { toApiQuery, type ListingFilters } from "@/features/listings/filters"

export type PhotoVariant = { width: number; url: string }

export type ListingCard = {
  id: string
  title: string
  listingType: "RENT" | "SALE"
  priceKobo: number
  rentPeriod?: "YEAR" | "MONTH" | null
  moveInTotalKobo?: number | null
  renewalKobo?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  toilets?: number | null
  furnishing?: "UNFURNISHED" | "SEMI_FURNISHED" | "FURNISHED" | null
  sizeSqm?: number | null
  propertyType?: string
  documentsVerified?: boolean
  cover: PhotoVariant[]
  publishedAt?: string
  latitude?: number | null
  longitude?: number | null
  location: { state?: string; lga?: string; area?: string }
  lister: { name: string; slug: string }
}

export type ListingFee = {
  feeType: string
  amountKobo: number
  frequency: "FIRST_PAYMENT" | "RECURRING"
  refundable?: boolean
}

export type ListingDetail = ListingCard & {
  description: string
  addressLine?: string
  propertyTypeGroup?: string
  fees: ListingFee[]
  amenities: {
    cluster: string
    items: { id: string; name: string; icon?: string | null }[]
  }[]
  photos: {
    id: string
    width: number
    height: number
    variants: PhotoVariant[]
  }[]
  lastConfirmedAvailableAt?: string | null
}

export type ListingsPage = { items: ListingCard[]; nextCursor: string | null }

export const listingsApi = {
  search: async (filters: ListingFilters, cursor?: string, limit = 12) => {
    const query = toApiQuery(filters, { cursor, limit })
    return (
      await apiRequest<ApiSuccess<ListingsPage>>(`/api/v1/listings?${query}`)
    ).data
  },
  get: async (id: string) =>
    (await apiRequest<ApiSuccess<ListingDetail>>(`/api/v1/listings/${id}`))
      .data,
}
