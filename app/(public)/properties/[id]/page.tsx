import type { Metadata } from "next"

import { ListingDetail } from "@/components/listings/detail/listing-detail"
import { SiteShell } from "@/components/site/site-shell"
import { fetchListingServer } from "@/lib/api/server-listings"
import { pageMetadata } from "@/lib/site"

const compactNaira = (kobo: number) => {
  const naira = kobo / 100
  if (naira >= 1_000_000)
    return `\u20A6${(naira / 1_000_000).toFixed(naira % 1_000_000 ? 1 : 0)}M`
  return `\u20A6${new Intl.NumberFormat("en-NG").format(naira)}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const listing = await fetchListingServer(id)
  const path = `/properties/${id}`

  if (!listing) {
    return pageMetadata({
      title: "Property | Veridom",
      description:
        "View photos, features and pricing, then book a viewing or reserve this verified property.",
      path,
    })
  }

  const price = `${compactNaira(listing.priceKobo)}${
    listing.listingType === "RENT"
      ? listing.rentPeriod === "MONTH"
        ? "/month"
        : "/year"
      : ""
  }`
  const place = [
    listing.location?.area,
    listing.location?.lga,
    listing.location?.state,
  ]
    .filter(Boolean)
    .join(", ")
  const facts = [
    listing.bedrooms ? `${listing.bedrooms} bed` : null,
    listing.bathrooms ? `${listing.bathrooms} bath` : null,
    listing.sizeSqm ? `${listing.sizeSqm} sqm` : null,
  ].filter(Boolean)
  const summary = (listing.description ?? "").replace(/\s+/g, " ").trim()
  const description = [
    [price, ...facts].join(" \u00B7 "),
    place,
    listing.documentsVerified ? "Documents verified" : null,
    summary
      ? summary.length > 110
        ? `${summary.slice(0, 107)}...`
        : summary
      : null,
  ]
    .filter(Boolean)
    .join(" | ")

  return pageMetadata({
    title: `${listing.title} \u00B7 ${price} | Veridom`,
    description,
    path,
    images: [
      {
        url: `/api/og/listing/${id}`,
        width: 1200,
        height: 630,
        alt: listing.title,
      },
    ],
  })
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <SiteShell cta={false} footer={false}>
      <ListingDetail id={id} />
    </SiteShell>
  )
}
