import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { HeroBadge } from "./hero-badge"

const stats = [
  { value: "200+", label: "Happy Customers" },
  { value: "10k+", label: "Properties For Clients" },
  { value: "16+", label: "Years of Experience" },
]

export function Hero() {
  return (
    <section className="relative grid min-h-0 px-4 pt-4 sm:px-8 lg:flex-1 lg:grid-cols-2 lg:p-0">
      <div className="relative z-[2] flex flex-col justify-center gap-6 pt-[4.5rem] pb-8 lg:min-h-0 lg:gap-[clamp(1rem,3.4vh,2rem)] lg:py-6 lg:pt-6 lg:pr-12 lg:pb-6 lg:pl-[max(2rem,calc((100vw-1440px)/2+3rem))]">
        <div className="flex flex-col gap-3 lg:gap-[clamp(0.5rem,2vh,1rem)]">
          <h1 className="animate-appear text-[1.75rem] leading-[1.2] font-semibold text-balance sm:text-4xl sm:leading-[1.15] lg:text-[clamp(2rem,min(3.6vw,6vh),3.25rem)]">
            Discover Your Dream Property with{" "}
            <span className="text-brand">Veridom</span>
          </h1>
          <p
            className="animate-appear max-w-lg text-sm leading-normal font-medium text-muted-foreground sm:text-base lg:text-[clamp(0.875rem,2vh,1rem)]"
            style={{ "--appear-delay": "100ms" } as React.CSSProperties}
          >
            Your journey to finding the perfect property begins here. Explore
            our listings to find the home that matches your dreams.
          </p>
        </div>

        <div
          className="animate-appear flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          style={{ "--appear-delay": "200ms" } as React.CSSProperties}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="#about">Learn More</Link>
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="#properties">Browse Properties</Link>
          </Button>
        </div>

        <dl
          className="animate-appear grid grid-cols-2 gap-3 text-center sm:grid-cols-3 sm:text-left"
          style={{ "--appear-delay": "300ms" } as React.CSSProperties}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-0.5 rounded-xl border bg-card px-4 py-2.5 last:col-span-2 sm:items-start sm:last:col-span-1 lg:py-[clamp(0.5rem,1.6vh,0.875rem)]"
            >
              <dd className="order-1 text-2xl leading-tight font-bold sm:text-3xl">
                {stat.value}
              </dd>
              <dt className="order-2 text-sm leading-snug font-medium text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <HeroBadge className="absolute top-[304px] left-6 z-10 size-[104px] sm:top-[344px] sm:left-10 lg:top-[12%] lg:left-1/2 lg:size-[132px] lg:-translate-x-1/2" />

      <div className="relative order-first h-[340px] overflow-hidden rounded-2xl bg-card ring-1 ring-border sm:h-[380px] lg:order-none lg:h-auto lg:min-h-0 lg:rounded-none">
        <Image
          src="/landing/abstract-lines.svg"
          alt=""
          fill
          unoptimized
          className="object-cover opacity-35 dark:opacity-70"
        />
        <Image
          src="/landing/image.png"
          alt="Modern glass high-rise towers"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[58%_100%] hue-rotate-[-95deg] lg:object-bottom"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(235deg,color-mix(in_oklab,var(--primary)_32%,var(--background))_8%,transparent_50%)] max-lg:opacity-70"
        />
      </div>
    </section>
  )
}
