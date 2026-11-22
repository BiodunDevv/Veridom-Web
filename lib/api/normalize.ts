import type { Deal, Inspection } from "@/lib/api/deals"

/**
 * The API sends titles and addresses flat (`listingTitle`, `addressLine`).
 * The UI reads a `listing` object, so build it once here and every screen agrees.
 */
export function normalizeDeal<T extends Deal>(deal: T): T {
  if (deal.listing?.title || !deal.listingTitle) return deal
  return {
    ...deal,
    listing: { ...deal.listing, id: deal.listingId, title: deal.listingTitle },
  }
}

export function normalizeInspection<T extends Inspection>(item: T): T {
  const listing = item.listing ?? {}
  const title = listing.title ?? item.listingTitle
  const addressLine = listing.addressLine ?? item.addressLine ?? undefined
  if (!title && !addressLine) return item
  return {
    ...item,
    listing: {
      ...listing,
      id: listing.id ?? item.listingId,
      title,
      addressLine,
    },
  }
}
