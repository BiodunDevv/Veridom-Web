import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { IconMask } from "./icon-mask"
import { Section } from "./section"
import { SectionHeading } from "./section-heading"
import { SectionPager } from "./section-pager"

const properties = [
  {
    name: "Seaside Serenity Villa",
    slug: "seaside-serenity-villa",
    blurb: "A stunning 4-bedroom, 3-bathroom villa in a peaceful suburban neighborhood...",
    image: "/landing/property-1.png",
    beds: "4-Bedroom",
    baths: "3-Bathroom",
    type: "Villa",
    price: "$550,000",
  },
  {
    name: "Metropolitan Haven",
    slug: "metropolitan-haven",
    blurb: "A chic and fully-furnished 2-bedroom apartment with panoramic city views...",
    image: "/landing/property-2.png",
    beds: "2-Bedroom",
    baths: "2-Bathroom",
    type: "Villa",
    price: "$550,000",
  },
  {
    name: "Rustic Retreat Cottage",
    slug: "rustic-retreat-cottage",
    blurb: "An elegant 3-bedroom, 2.5-bathroom townhouse in a gated community...",
    image: "/landing/property-3.png",
    tint: "hue-rotate-[-135deg]",
    beds: "3-Bedroom",
    baths: "3-Bathroom",
    type: "Villa",
    price: "$550,000",
  },
]

export function Properties() {
  return (
    <Section id="properties">
      <SectionHeading
        title="Featured Properties"
        description='Explore our handpicked selection of featured properties. Each listing offers a glimpse into exceptional homes and investments available through Veridom. Click "View Details" for more information.'
        action="View All Properties"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <article key={property.name} className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-md">
            <div className="relative h-44 overflow-hidden rounded-lg">
              <Image
                src={property.image}
                alt={property.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className={`object-cover ${"tint" in property ? property.tint : ""}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{property.name}</h3>
              <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                {property.blurb}{" "}
                <Link href="#" className="text-foreground underline underline-offset-2">
                  Read More
                </Link>
              </p>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {[
                { icon: "/landing/icon-bed.svg", label: property.beds },
                { icon: "/landing/icon-bath.svg", label: property.baths },
                { icon: "/landing/icon-villa.svg", label: property.type },
              ].map((chip) => (
                <li
                  key={chip.label}
                  className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                >
                  <IconMask src={chip.icon} className="size-4" />
                  {chip.label}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-end gap-6">
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-muted-foreground">Price</span>
                <span className="text-lg font-semibold">{property.price}</span>
              </div>
              <Button asChild className="flex-1">
                <Link href={`/properties/${property.slug}`}>View Property Details</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
      <SectionPager total={60} />
    </Section>
  )
}
