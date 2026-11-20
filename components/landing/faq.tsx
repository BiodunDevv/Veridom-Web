import Link from "next/link"

import { Button } from "@/components/ui/button"

import { Section } from "./section"
import { SectionHeading } from "./section-heading"
import { SectionPager } from "./section-pager"

const faqs = [
  {
    q: "How do I search for properties on Veridom?",
    a: "Learn how to use our user-friendly search tools to find properties that match your criteria.",
  },
  {
    q: "What documents do I need to sell my property through Veridom?",
    a: "Find out about the necessary documentation for listing your property with us.",
  },
  {
    q: "How can I contact a Veridom agent?",
    a: "Discover the different ways you can get in touch with our experienced agents.",
  },
]

export function Faq() {
  return (
    <Section id="faq">
      <SectionHeading
        title="Frequently Asked Questions"
        description="Find answers to common questions about Veridom's services, property listings, and the real estate process. We're here to provide clarity and assist you every step of the way."
        action="View All FAQ’s"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {faqs.map((faq) => (
          <article key={faq.q} className="flex flex-col items-start gap-3 rounded-xl bg-card p-5 shadow-md lg:p-6">
            <h3 className="text-lg font-semibold">{faq.q}</h3>
            <p className="text-sm leading-relaxed font-medium text-muted-foreground">{faq.a}</p>
            <Button asChild variant="secondary" size="sm" className="mt-auto">
              <Link href="#">Read More</Link>
            </Button>
          </article>
        ))}
      </div>
      <SectionPager total={10} />
    </Section>
  )
}
