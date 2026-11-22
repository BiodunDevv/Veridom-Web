"use client"

import {
  ListingCard,
  ListingCardSkeleton,
} from "@/components/listings/listing-card"
import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { useListingSearch } from "@/features/listings/hooks"

export function Properties() {
  const { data, isPending, isError } = useListingSearch({}, 3)
  const items = data?.pages[0]?.items ?? []

  return (
    <Section id="properties">
      <SectionHeading
        title="Featured Properties"
        description="Explore our newest verified listings. Each one is reviewed by the Veridom team before it goes live."
        action="View All Properties"
        href="/properties"
      />
      {isPending ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : isError || items.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-md">
          {isError
            ? "Listings are unavailable right now. Please check back shortly."
            : "New listings are coming soon."}
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </Section>
  )
}
