import Image from "next/image"

import { Section } from "@/components/landing/section"

const stats = [
  { value: "200+", label: "Happy Customers" },
  { value: "10k+", label: "Properties For Clients" },
  { value: "16+", label: "Years of Experience" },
]

export function Journey() {
  return (
    <Section id="journey" className="pt-8 lg:pt-14">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6 lg:gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="animate-appear text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Our Journey
            </h1>
            <p className="animate-appear text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg" style={{ "--appear-delay": "100ms" } as React.CSSProperties}>
              Our story is one of continuous growth and evolution. We started as a small team with
              big dreams, determined to create a real estate platform that transcended the ordinary.
              Over the years, we&apos;ve expanded our reach, forged valuable partnerships, and gained
              the trust of countless clients.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3 lg:gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5 rounded-xl bg-card p-3 shadow-md sm:p-5">
                <dd className="order-1 text-2xl font-bold sm:text-3xl lg:text-4xl">{stat.value}</dd>
                <dt className="order-2 text-xs font-medium text-muted-foreground sm:text-sm lg:text-base">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative isolate h-[300px] overflow-hidden rounded-xl bg-secondary sm:h-[420px] lg:h-[480px]">
          <Image src="/landing/abstract-lines.svg" alt="" fill unoptimized className="-z-10 object-cover opacity-30 dark:opacity-40" />
          <Image
            src="/about/house.png"
            alt="A hand presenting a model of a modern home"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain object-right"
          />
        </div>
      </div>
    </Section>
  )
}
