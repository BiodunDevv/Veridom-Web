import type { Metadata } from "next"

import { ListingDetail } from "@/components/listings/detail/listing-detail"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Property Details | Veridom",
  description:
    "View photos, features and pricing, then book a viewing or reserve this verified property.",
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <SiteShell>
      <ListingDetail id={id} />
    </SiteShell>
  )
}
