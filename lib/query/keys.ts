import type { ListingFilters } from "@/features/listings/filters"

export const queryKeys = {
  me: ["me"] as const,
  sessions: ["sessions"] as const,
  deals: ["deals"] as const,
  deal: (id: string) => ["deals", "detail", id] as const,
  inspections: ["inspections"] as const,
  inspection: (id: string) => ["inspections", "detail", id] as const,
  inspectionPhotos: (id: string) => ["inspections", "photos", id] as const,
  org: {
    mine: ["org", "mine"] as const,
    active: (id: string | null) => ["org", "active", id] as const,
    roles: ["org", "roles"] as const,
    members: ["org", "members"] as const,
    invites: ["org", "invites"] as const,
    audit: ["org", "audit"] as const,
  },
  lister: {
    listings: (status: string, page: number) =>
      ["lister", "listings", status, page] as const,
    listing: (id: string) => ["lister", "listing", id] as const,
    photos: (id: string) => ["lister", "photos", id] as const,
    documents: (id: string) => ["lister", "documents", id] as const,
    inspections: ["lister", "inspections"] as const,
    inspection: (id: string) => ["lister", "inspections", id] as const,
    availability: (id: string) => ["lister", "availability", id] as const,
    deal: (id: string) => ["lister", "deal", id] as const,
    deals: ["lister", "deals"] as const,
    payout: ["lister", "payout"] as const,
  },
  catalog: {
    propertyTypes: ["catalog", "property-types"] as const,
    amenities: ["catalog", "amenities"] as const,
    locations: (parentId?: string) =>
      ["catalog", "locations", parentId ?? "root"] as const,
  },
  listings: {
    search: (filters: ListingFilters) =>
      ["listings", "search", filters] as const,
    detail: (id: string) => ["listings", "detail", id] as const,
    slots: (id: string, from: string, to: string) =>
      ["listings", "slots", id, from, to] as const,
  },
}
