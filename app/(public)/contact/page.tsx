import type { Metadata } from "next"

import { ContactStrip } from "@/components/contact/contact-strip"
import { Gallery } from "@/components/contact/gallery"
import { Offices } from "@/components/contact/offices"
import { InquiryForm } from "@/components/contact/inquiry-form"
import { PageHero } from "@/components/site/page-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Contact | Veridom",
  description: "Talk to the Veridom team about buying, renting, selling or investing in verified properties.",
}

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        title="Get in Touch with Veridom"
        description="Welcome to Veridom's Contact Us page. We're here to assist you with any inquiries, requests, or feedback you may have. Whether you're looking to buy or sell a property, explore investment opportunities, or simply want to connect, we're just a message away. Reach out to us, and let's start a conversation."
        className="border-b-0"
      />
      <ContactStrip />
      <InquiryForm />
      <Offices />
      <Gallery />
    </SiteShell>
  )
}
