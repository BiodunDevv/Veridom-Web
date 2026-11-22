import type { Metadata } from "next"
import { Suspense } from "react"

import { ListingSearch } from "@/components/listings/listing-search"
import { PageHero } from "@/components/site/page-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Properties | Veridom",
  description: "Search verified homes to rent or buy across Nigeria. Filter by location, type, price and amenities.",
}

export default function PropertiesPage() {
  return (
    <SiteShell>
      <PageHero
        title="Find Your Dream Property"
        description="Search verified listings by location, type, price and amenities. Every listing is reviewed by the Veridom team before it goes live."
        className="pb-8 lg:pb-12"
      />
      <Suspense>
        <ListingSearch />
      </Suspense>
    </SiteShell>
  )
}
