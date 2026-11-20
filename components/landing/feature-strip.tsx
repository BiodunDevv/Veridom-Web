import Image from "next/image"
import Link from "next/link"

import { IconMask } from "./icon-mask"

const features = [
  { title: "Find Your Dream Home", icon: "/landing/icon-home.svg", href: "/properties" },
  { title: "Unlock Property Value", icon: "/landing/icon-value.svg", href: "/services#unlock-value" },
  { title: "Effortless Property Management", icon: "/landing/icon-manage.svg", href: "/services#property-management" },
  { title: "Smart Investments, Informed Decisions", icon: "/landing/icon-invest.svg", href: "/services#smart-investments" },
]

export function FeatureStrip() {
  return (
    <section
      id="services"
      aria-label="What we do"
      className="grid shrink-0 grid-cols-2 gap-2.5 bg-muted/60 p-2.5 sm:gap-3 sm:p-3 lg:grid-cols-4"
    >
      {features.map((feature) => (
        <Link
          key={feature.title}
          href={feature.href}
          className="group relative flex flex-col items-center gap-2.5 rounded-xl bg-card px-3 py-4 sm:gap-3 sm:px-4 sm:py-5 lg:py-[clamp(0.75rem,2.4vh,1.5rem)] text-center outline-none transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="rounded-full border border-primary/50 p-1.5">
            <span className="block rounded-full border border-primary/50 p-2.5">
              <Image src={feature.icon} alt="" width={26} height={26} unoptimized />
            </span>
          </span>
          <span className="text-sm leading-snug font-semibold sm:text-base">{feature.title}</span>
          <IconMask
            src="/landing/icon-arrow.svg"
            className="absolute top-2.5 right-2.5 size-4 sm:top-3 sm:right-3 sm:size-5 text-muted-foreground transition-colors group-hover:text-primary"
          />
        </Link>
      ))}
    </section>
  )
}
