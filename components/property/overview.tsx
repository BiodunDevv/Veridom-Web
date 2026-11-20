import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { type Property, usd } from "@/lib/data/properties"

import { Gallery } from "./gallery"

const pad = (n: number) => String(n).padStart(2, "0")

export function Overview({ property }: { property: Property }) {
  const stats = [
    { label: "Bedrooms", icon: "/property/icon-bed.svg", value: pad(property.beds) },
    { label: "Bathrooms", icon: "/property/icon-bath.svg", value: pad(property.baths) },
    { label: "Area", icon: "/property/icon-area.svg", value: `${property.areaSqFt.toLocaleString("en-US")} Square Feet` },
  ]

  return (
    <Section id="overview" className="pt-6 lg:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <h1 className="animate-appear text-2xl font-semibold tracking-tight sm:text-3xl">{property.name}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium sm:text-base">
            <IconMask src="/property/icon-pin.svg" className="size-5" />
            {property.location}
          </span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-muted-foreground sm:text-base">Price</span>
          <span className="text-xl font-semibold sm:text-2xl">{usd.format(property.price)}</span>
        </div>
      </div>

      <Gallery images={property.images} name={property.name} tint={property.tint} />

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-6 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:gap-8 lg:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold sm:text-2xl">Description</h2>
            <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">{property.description}</p>
          </div>
          <dl className="grid grid-cols-3 divide-x border-t pt-5">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`flex flex-col gap-2 ${index > 0 ? "pl-3 sm:pl-5" : "pr-3"}`}>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-base">
                  <IconMask src={stat.icon} className="size-4 sm:size-5" />
                  {stat.label}
                </dt>
                <dd className="text-base font-semibold sm:text-xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:gap-8 lg:p-10">
          <h2 className="text-xl font-semibold sm:text-2xl">Key Features and Amenities</h2>
          <ul className="flex flex-col gap-3">
            {property.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 border-l-2 border-primary bg-linear-to-r from-primary/10 to-transparent px-4 py-3 text-sm font-medium text-muted-foreground sm:px-6 sm:py-4 sm:text-base"
              >
                <IconMask src="/property/icon-bolt.svg" className="size-5 text-foreground" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
