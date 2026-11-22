import type { Metadata } from "next"

import { pageMetadata } from "@/lib/site"
import {
  ServicesExplorer,
  ServicesProcess,
} from "@/components/services/services-explorer"
import { ServicesHero } from "@/components/services/services-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = pageMetadata({
  title: "Services | Veridom",
  description:
    "Property valuation, marketing, management and investment advisory, delivered by the Veridom team.",
  path: "/services",
})

export default function ServicesPage() {
  return (
    <SiteShell>
      <ServicesHero />
      <ServicesExplorer />
      <ServicesProcess />
    </SiteShell>
  )
}
