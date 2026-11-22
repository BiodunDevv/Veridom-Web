import Link from "next/link"
import { BadgeCheck, BedDouble, Bath, Ruler } from "lucide-react"

import { ListingImage } from "@/components/listings/listing-image"
import { Button } from "@/components/ui/button"
import type { ListingCard as Listing } from "@/lib/api/listings"
import { formatNaira } from "@/lib/format"

export const priceSuffix = (
  listing: Pick<Listing, "listingType" | "rentPeriod">
) =>
  listing.listingType === "RENT"
    ? listing.rentPeriod === "MONTH"
      ? "/ month"
      : "/ year"
    : ""

export const placeLabel = (location: Listing["location"]) =>
  [location.area, location.lga, location.state].filter(Boolean).join(", ")

export function ListingCard({
  listing,
  priority,
}: {
  listing: Listing
  priority?: boolean
}) {
  const href = `/properties/${listing.id}`

  return (
    <article className="group flex flex-col gap-4 rounded-xl bg-card p-4 shadow-md transition-shadow hover:shadow-xl">
      <Link
        href={href}
        className="relative block h-48 overflow-hidden rounded-lg"
        aria-label={listing.title}
      >
        <ListingImage
          variants={listing.cover}
          alt={listing.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          className="size-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {listing.listingType === "RENT" ? "For rent" : "For sale"}
        </span>
        {listing.documentsVerified ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            <BadgeCheck className="size-3.5" /> Documents verified
          </span>
        ) : null}
      </Link>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-lg font-semibold">
          <Link href={href}>{listing.title}</Link>
        </h3>
        <p className="line-clamp-1 text-sm font-medium text-muted-foreground">
          {placeLabel(listing.location) || "Location on request"}
        </p>
      </div>

      <ul className="flex flex-wrap gap-1.5 text-xs font-medium">
        {listing.propertyType ? (
          <li className="rounded-full bg-secondary px-3 py-1">
            {listing.propertyType}
          </li>
        ) : null}
        {listing.bedrooms != null ? (
          <li className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <BedDouble className="size-3.5" /> {listing.bedrooms} bed
          </li>
        ) : null}
        {listing.bathrooms != null ? (
          <li className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <Bath className="size-3.5" /> {listing.bathrooms} bath
          </li>
        ) : null}
        {listing.sizeSqm ? (
          <li className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <Ruler className="size-3.5" /> {listing.sizeSqm} sqm
          </li>
        ) : null}
      </ul>

      <div className="mt-auto flex items-end justify-between gap-4">
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium text-muted-foreground">
            {listing.listingType === "RENT" ? "Rent" : "Price"}
          </span>
          <span className="text-lg font-semibold">
            {formatNaira(listing.priceKobo)}{" "}
            <span className="text-sm font-medium text-muted-foreground">
              {priceSuffix(listing)}
            </span>
          </span>
          {listing.moveInTotalKobo ? (
            <span className="text-xs text-muted-foreground">
              Move-in {formatNaira(listing.moveInTotalKobo)}
            </span>
          ) : null}
        </div>
        <Button asChild size="sm">
          <Link href={href}>View details</Link>
        </Button>
      </div>
    </article>
  )
}

export function ListingCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-md"
      aria-hidden
    >
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-8 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}
