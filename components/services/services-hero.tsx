import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

const stats = [
  { value: "12", label: "Services" },
  { value: "3", label: "Ways we help" },
  { value: "1", label: "Accountable team" },
]

export function ServicesHero() {
  return (
    <section className="border-b bg-linear-to-br from-secondary/80 via-background to-background">
      <div className="mx-auto grid max-w-[1280px] items-end gap-8 px-4 pt-10 pb-12 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:px-12 lg:pt-16 lg:pb-16">
        <div className="flex flex-col gap-5">
          <span className="animate-appear inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Sell, manage, invest
          </span>
          <h1 className="animate-appear text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Everything between you and the keys
          </h1>
          <p
            className="animate-appear max-w-2xl text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg"
            style={{ "--appear-delay": "100ms" } as React.CSSProperties}
          >
            From a fair valuation to a safe handover, Veridom guides sellers,
            landlords and investors with verified people and tracked payments.
          </p>
          <div
            className="animate-appear flex flex-wrap gap-3"
            style={{ "--appear-delay": "200ms" } as React.CSSProperties}
          >
            <Button asChild size="lg">
              <Link href="#explore">
                Explore services <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact#message">Talk to us</Link>
            </Button>
          </div>
        </div>
        <dl
          className="animate-appear grid grid-cols-3 gap-3"
          style={{ "--appear-delay": "250ms" } as React.CSSProperties}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 rounded-2xl bg-card p-4 shadow-md"
            >
              <dd className="order-1 text-3xl font-bold lg:text-4xl">
                {s.value}
              </dd>
              <dt className="order-2 text-xs font-medium text-muted-foreground sm:text-sm">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
