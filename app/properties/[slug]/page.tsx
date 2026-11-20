import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Faq } from "@/components/landing/faq"
import { Overview } from "@/components/property/overview"
import { Pricing } from "@/components/property/pricing"
import { PropertyInquiry } from "@/components/property/property-inquiry"
import { SiteShell } from "@/components/site/site-shell"
import { getProperty, properties } from "@/lib/data/properties"

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = getProperty(slug)
  return property
    ? { title: `${property.name} | Veridom`, description: property.description }
    : { title: "Property not found | Veridom" }
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params
  const property = getProperty(slug)
  if (!property) notFound()

  return (
    <SiteShell>
      <Overview property={property} />
      <PropertyInquiry property={property} />
      <Pricing property={property} />
      <Faq />
    </SiteShell>
  )
}
