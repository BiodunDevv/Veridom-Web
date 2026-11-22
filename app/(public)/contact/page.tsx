import type { Metadata } from "next"

import { ContactStrip } from "@/components/contact/contact-strip"
import { Offices } from "@/components/contact/offices"
import { InquiryForm } from "@/components/contact/inquiry-form"
import { ContactHero } from "@/components/contact/contact-hero"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Contact | Veridom",
  description:
    "Talk to the Veridom team about buying, renting, selling or investing in verified properties.",
}

export default function ContactPage() {
  return (
    <SiteShell cta={false}>
      <ContactHero />
      <ContactStrip />
      <InquiryForm />
      <Offices />
    </SiteShell>
  )
}
