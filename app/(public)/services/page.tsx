import type { Metadata } from "next"

import { FeatureStrip } from "@/components/landing/feature-strip"
import {
  InvestmentServices,
  ManagementServices,
  SellingServices,
} from "@/components/services/service-groups"
import { PageHero } from "@/components/site/page-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Services | Veridom",
  description: "Property valuation, marketing, management and investment advisory, delivered by the Veridom team.",
}

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageHero
        title="Elevate Your Real Estate Experience"
        description="Welcome to Veridom, where your real estate aspirations meet expert guidance. Explore our comprehensive range of services, each designed to cater to your unique needs and dreams."
        className="border-b-0"
      />
      <FeatureStrip />
      <SellingServices />
      <ManagementServices />
      <InvestmentServices />
    </SiteShell>
  )
}
