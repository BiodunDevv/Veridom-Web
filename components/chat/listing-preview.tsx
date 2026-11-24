"use client"

import Link from "next/link"
import { ArrowUpRight, Bath, BedDouble, BadgeCheck, MapPin } from "lucide-react"

import { ListingImage } from "@/components/listings/listing-image"
import { placeLabel, priceSuffix } from "@/components/listings/listing-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useListing } from "@/features/listings/hooks"
import { formatNaira } from "@/lib/format"

/**
 * The property this conversation is about, pinned under the chat header:
 * photo, price, place and a link back to the listing. Hidden quietly if the
 * listing can't be loaded (for example it is no longer public).
 */
export function ListingPreview({
  listingId,
  title,
}: {
  listingId?: string
  title?: string
}) {
  const { data: listing, isPending, isError } = useListing(listingId ?? "")

  if (!listingId) return null
  if (isPending)
    return (
      <div
        className="flex items-center gap-3 border-b bg-card px-3 py-2.5 sm:px-4"
        aria-busy
      >
        <Skeleton className="size-14 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    )
  if (isError || !listing) return null

  const place = placeLabel(listing.location)

  return (
    <Link
      href={`/properties/${listing.id}`}
      className="group flex items-center gap-3 border-b bg-card px-3 py-2.5 transition-colors outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-4"
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
        <ListingImage
          variants={listing.cover}
          alt={listing.title || title || "Property"}
          sizes="56px"
          className="size-full transition-transform duration-500 group-hover:scale-110"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">
            {listing.title}
          </span>
          {listing.documentsVerified ? (
            <BadgeCheck
              className="size-4 shrink-0 text-primary"
              aria-label="Documents verified"
            />
          ) : null}
        </span>
        <span className="flex items-baseline gap-1.5 text-sm">
          <span className="font-semibold text-primary tabular-nums">
            {formatNaira(listing.priceKobo)}
          </span>
          <span className="text-xs text-muted-foreground">
            {priceSuffix(listing)}
          </span>
        </span>
        <span className="flex items-center gap-2.5 text-xs text-muted-foreground">
          {place ? (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{place}</span>
            </span>
          ) : null}
          {listing.bedrooms != null ? (
            <span className="flex shrink-0 items-center gap-1">
              <BedDouble className="size-3" aria-hidden /> {listing.bedrooms}
            </span>
          ) : null}
          {listing.bathrooms != null ? (
            <span className="hidden shrink-0 items-center gap-1 sm:flex">
              <Bath className="size-3" aria-hidden /> {listing.bathrooms}
            </span>
          ) : null}
        </span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  )
}
