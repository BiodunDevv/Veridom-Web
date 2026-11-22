import type { Metadata } from "next"

import { pageMetadata } from "@/lib/site"
import { Suspense } from "react"

import { ListingSearch } from "@/components/listings/listing-search"
import { PropertiesHero } from "@/components/listings/properties-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = pageMetadata({
  title: "Properties | Veridom",
  description:
    "Search verified homes to rent or buy across Nigeria. Filter by location, type, price and amenities.",
  path: "/properties",
})

export default function PropertiesPage() {
  return (
    <SiteShell cta={false}>
      <PropertiesHero />
      <Suspense>
        <ListingSearch />
      </Suspense>
    </SiteShell>
  )
}
