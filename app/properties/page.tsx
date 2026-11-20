import type { Metadata } from "next"

import { CategoryGrid } from "@/components/properties/category-grid"
import { InquiryForm } from "@/components/properties/inquiry-form"
import { PropertySearch } from "@/components/properties/property-search"
import { PageHero } from "@/components/site/page-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Properties | Veridom",
  description: "Search and discover homes and investments curated by Veridom.",
}

export default function PropertiesPage() {
  return (
    <SiteShell>
      <PageHero
        title="Find Your Dream Property"
        description="Welcome to Veridom, where your dream property awaits in every corner of our beautiful world. Explore our curated selection of properties, each offering a unique story and a chance to redefine your life. With categories to suit every dreamer, your journey"
        className="pb-8 lg:pb-12"
      />
      <PropertySearch />
      <CategoryGrid />
      <InquiryForm />
    </SiteShell>
  )
}
