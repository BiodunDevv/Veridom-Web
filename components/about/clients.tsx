import Link from "next/link"

import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { SectionPager } from "@/components/landing/section-pager"
import { Button } from "@/components/ui/button"

const clients = [
  { since: "Since 2019", name: "ABC Corporation", domain: "Commercial Real Estate", category: "Luxury Home Development", quote: "Veridom's expertise in finding the perfect office space for our expanding operations was invaluable. They truly understand our business needs." },
  { since: "Since 2018", name: "GreenTech Enterprises", domain: "Commercial Real Estate", category: "Retail Space", quote: "Veridom's ability to identify prime retail locations helped us expand our brand presence. They are a trusted partner in our growth." },
]

export function Clients() {
  return (
    <Section id="clients">
      <SectionHeading
        title="Our Valued Clients"
        description="At Veridom, we have had the privilege of working with a diverse range of clients across various industries. Here are some of the clients we've had the pleasure of serving"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:gap-8">
        {clients.map((client) => (
          <article key={client.name} className="flex flex-col gap-6 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:gap-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground sm:text-base">{client.since}</p>
                <h3 className="text-xl font-semibold sm:text-2xl lg:text-3xl">{client.name}</h3>
              </div>
              <Button asChild variant="outline" size="lg" className="shrink-0">
                <Link href="#">Visit Website</Link>
              </Button>
            </div>
            <dl className="grid grid-cols-2 divide-x">
              <div className="flex flex-col gap-2 pr-4">
                <dt className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground sm:text-base">
                  <IconMask src="/about/icon-domain.svg" className="size-5" />
                  Domain
                </dt>
                <dd className="text-sm font-medium sm:text-lg">{client.domain}</dd>
              </div>
              <div className="flex flex-col gap-2 pl-4 sm:pl-6">
                <dt className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground sm:text-base">
                  <IconMask src="/about/icon-category.svg" className="size-5" />
                  Category
                </dt>
                <dd className="text-sm font-medium sm:text-lg">{client.category}</dd>
              </div>
            </dl>
            <blockquote className="flex flex-col gap-3 rounded-xl bg-secondary p-5 sm:p-6">
              <p className="text-sm font-medium text-muted-foreground sm:text-base">What They Said 🤗</p>
              <p className="text-sm leading-relaxed font-medium sm:text-base lg:text-lg">{client.quote}</p>
            </blockquote>
          </article>
        ))}
      </div>
      <SectionPager total={10} />
    </Section>
  )
}
