"use client"

import { ListingMapCard } from "@/components/map/listing-map-card"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  MapPin,
  Ruler,
  ShowerHead,
} from "lucide-react"

import { PhotoGallery } from "@/components/listings/detail/photo-gallery"
import { ReserveCard } from "@/components/listings/detail/reserve-card"
import { placeLabel, priceSuffix } from "@/components/listings/listing-card"
import { Section } from "@/components/landing/section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useListing } from "@/features/listings/hooks"
import { getApiErrorMessage, isApiError } from "@/lib/api/client"
import { formatNaira } from "@/lib/format"

const feeLabel: Record<string, string> = {
  CAUTION_DEPOSIT: "Caution deposit",
  SERVICE_CHARGE: "Service charge",
  LEGAL_FEE: "Legal fee",
  AGREEMENT_FEE: "Agreement fee",
  OTHER: "Other fee",
}

const furnishingLabel = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FURNISHED: "Furnished",
} as const

function Skeleton() {
  return (
    <Section id="listing" className="pt-6" aria-busy aria-label="Loading">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-3/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="grid gap-2 sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
        <div className="aspect-[16/10] animate-pulse rounded-2xl bg-muted sm:row-span-2 sm:aspect-auto sm:min-h-80" />
        <div className="hidden animate-pulse rounded-2xl bg-muted sm:block" />
        <div className="hidden animate-pulse rounded-2xl bg-muted sm:block" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-3">
          {[80, 100, 90, 60].map((w) => (
            <div
              key={w}
              className="h-4 animate-pulse rounded bg-muted"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      </div>
    </Section>
  )
}

export function ListingDetail({ id }: { id: string }) {
  const { data: listing, isPending, error, refetch } = useListing(id)

  if (isPending) return <Skeleton />

  if (error || !listing) {
    const missing = isApiError(error) && error.status === 404
    return (
      <Section id="listing" className="pt-10">
        <Alert variant={missing ? "default" : "destructive"}>
          <AlertTitle>
            {missing
              ? "This listing isn't available"
              : "We couldn't load this listing"}
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {missing
              ? "It may have been rented, sold or paused."
              : getApiErrorMessage(error, "Please try again.")}
            {missing ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/properties">Browse properties</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </Section>
    )
  }

  const stats = [
    listing.bedrooms != null && {
      icon: BedDouble,
      label: "Bedrooms",
      value: listing.bedrooms,
    },
    listing.bathrooms != null && {
      icon: Bath,
      label: "Bathrooms",
      value: listing.bathrooms,
    },
    listing.toilets != null && {
      icon: ShowerHead,
      label: "Toilets",
      value: listing.toilets,
    },
    listing.sizeSqm && {
      icon: Ruler,
      label: "Size",
      value: `${listing.sizeSqm} sqm`,
    },
  ].filter(Boolean) as {
    icon: typeof Bath
    label: string
    value: string | number
  }[]

  const mapHref =
    listing.latitude != null && listing.longitude != null
      ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`
      : null

  return (
    <Section id="listing" className="pt-6 lg:pt-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to results
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              {listing.listingType === "RENT" ? "For rent" : "For sale"}
            </span>
            {listing.propertyType ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                {listing.propertyType}
              </span>
            ) : null}
            {listing.documentsVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <BadgeCheck className="size-3.5" /> Documents verified
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {listing.title}
          </h1>
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <MapPin className="size-4" />
            {[listing.addressLine, placeLabel(listing.location)]
              .filter(Boolean)
              .join(", ")}
            {mapHref ? (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary underline underline-offset-2"
              >
                View on map
              </a>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col leading-tight sm:text-right">
          <span className="text-2xl font-semibold sm:text-3xl">
            {formatNaira(listing.priceKobo)}
          </span>
          <span className="text-sm text-muted-foreground">
            {priceSuffix(listing) || "asking price"}
          </span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6">
          <PhotoGallery photos={listing.photos} title={listing.title} />

          {stats.length ? (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-xl bg-card p-4 shadow-md"
                >
                  <dt className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Icon className="size-4" /> {label}
                  </dt>
                  <dd className="text-lg font-semibold">{value}</dd>
                </div>
              ))}
              {listing.furnishing ? (
                <div className="flex flex-col gap-1 rounded-xl bg-card p-4 shadow-md">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Furnishing
                  </dt>
                  <dd className="text-lg font-semibold">
                    {furnishingLabel[listing.furnishing]}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <section className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md sm:p-6">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground sm:text-base">
              {listing.description}
            </p>
          </section>

          {listing.amenities.length ? (
            <section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6">
              <h2 className="text-xl font-semibold">Amenities</h2>
              {listing.amenities.map((group) => (
                <div key={group.cluster} className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {group.cluster}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium"
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ) : null}

          {listing.latitude != null && listing.longitude != null ? (
            <ListingMapCard
              lat={listing.latitude}
              lng={listing.longitude}
              place={placeLabel(listing.location)}
            />
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          {listing.listingType === "RENT" ? (
            <section
              className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md"
              aria-labelledby="costs"
            >
              <h2 id="costs" className="text-lg font-semibold">
                What you pay
              </h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Rent {priceSuffix(listing)}
                  </dt>
                  <dd className="font-medium">
                    {formatNaira(listing.priceKobo)}
                  </dd>
                </div>
                {listing.fees.map((fee, index) => (
                  <div
                    key={`${fee.feeType}-${index}`}
                    className="flex justify-between gap-4"
                  >
                    <dt className="text-muted-foreground">
                      {feeLabel[fee.feeType] ?? fee.feeType}
                      <span className="block text-xs">
                        {fee.frequency === "RECURRING"
                          ? "Every renewal"
                          : "First payment"}
                        {fee.refundable ? " · refundable" : ""}
                      </span>
                    </dt>
                    <dd className="font-medium">
                      {formatNaira(fee.amountKobo)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-1 border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Move-in total</span>
                  <span>{formatNaira(listing.moveInTotalKobo)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>On renewal</span>
                  <span>{formatNaira(listing.renewalKobo)}</span>
                </div>
              </div>
            </section>
          ) : null}
          <ReserveCard listing={listing} />
        </aside>
      </div>
    </Section>
  )
}
