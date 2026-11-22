"use client"

import * as React from "react"
import Link from "next/link"

import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { Button } from "@/components/ui/button"

type Region = "regional" | "international"

const tabs = [
  { value: "all", label: "All" },
  { value: "regional", label: "Regional" },
  { value: "international", label: "International" },
] as const

const offices: {
  kind: string
  region: Region
  address: string
  blurb: string
  email: string
  phone: string
  city: string
}[] = [
  {
    kind: "Main Headquarters",
    region: "international",
    address: "123 Veridom Plaza, City Center, Metropolis",
    blurb:
      "Our main headquarters serve as the heart of Veridom. Located in the bustling city center, this is where our core team of experts operates, driving the excellence and innovation that define us.",
    email: "info@veridom.com",
    phone: "+1 (123) 456-7890",
    city: "Metropolis",
  },
  {
    kind: "Regional Offices",
    region: "regional",
    address: "456 Urban Avenue, Downtown District, Metropolis",
    blurb:
      "Veridom's presence extends to multiple regions, each with its own dynamic real estate landscape. Discover our regional offices, staffed by local experts who understand the nuances of their respective markets.",
    email: "regional@veridom.com",
    phone: "+1 (123) 628-7890",
    city: "Metropolis",
  },
]

export function Offices() {
  const [tab, setTab] = React.useState<(typeof tabs)[number]["value"]>("all")
  const visible = offices.filter(
    (office) => tab === "all" || office.region === tab
  )

  return (
    <Section id="offices">
      <SectionHeading
        title="Discover Our Office Locations"
        description="Veridom is here to serve you across multiple locations. Whether you're looking to meet our team, discuss real estate opportunities, or simply drop by for a chat, we have offices conveniently located to serve your needs. Explore the categories below to find the Veridom office nearest to you"
      />

      <div
        role="tablist"
        aria-label="Office type"
        className="grid w-full grid-cols-3 gap-2 self-start rounded-xl bg-secondary p-2 sm:w-[516px]"
      >
        {tabs.map((item) => (
          <Button
            key={item.value}
            role="tab"
            aria-selected={tab === item.value}
            variant={tab === item.value ? "default" : "ghost"}
            size="lg"
            className="px-2 sm:px-4"
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
        {visible.map((office) => (
          <article
            key={office.kind}
            className="flex flex-col gap-6 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium sm:text-base">{office.kind}</p>
              <h3 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
                {office.address}
              </h3>
              <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
                {office.blurb}
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {[
                { icon: "/contact/chip-mail.svg", label: office.email },
                { icon: "/contact/chip-phone.svg", label: office.phone },
                { icon: "/contact/chip-pin.svg", label: office.city },
              ].map((chip) => (
                <li
                  key={chip.label}
                  className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-xs font-medium sm:text-sm"
                >
                  <IconMask src={chip.icon} className="size-4 sm:size-5" />
                  {chip.label}
                </li>
              ))}
            </ul>
            <Button asChild size="xl" className="mt-auto w-full">
              <Link href="#">Get Direction</Link>
            </Button>
          </article>
        ))}
      </div>
    </Section>
  )
}
