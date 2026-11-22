import Link from "next/link"
import { ArrowUpRight, BadgeCheck, FileCheck2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { HighlightPillars } from "./highlight-pillars"
import { Section } from "./section"
import { SectionHeading } from "./section-heading"

const stats = [
  { value: "100%", label: "Listings reviewed" },
  { value: "24h", label: "Typical review time" },
  { value: "3", label: "Steps to reserve" },
]

const checks = [
  "Ownership documents checked",
  "Photos and details confirmed",
  "Price and location validated",
]

export function About() {
  return (
    <Section id="about" className="bg-muted/60">
      <SectionHeading
        title="Why Veridom"
        description="We make buying and renting property in Nigeria simple, verified and transparent, from the first search to the final handover."
        action="About Us"
        href="/about"
      />
      <HighlightPillars />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-card p-6 shadow-md lg:col-span-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Built on trust, end to end
            </h3>
            <p className="max-w-xl text-sm leading-relaxed font-medium text-muted-foreground">
              Veridom connects buyers, renters, owners and agents on one
              platform. Verified listings, booked viewings and tracked payments
              mean fewer surprises for everyone involved.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-muted/70 px-4 py-3 dark:bg-muted/40"
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                  {s.value}
                </dd>
                <p className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-md">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCheck2 className="size-5" />
          </span>
          <h3 className="text-lg font-semibold">How we verify</h3>
          <ul className="flex flex-col gap-2.5">
            {checks.map((c) => (
              <li
                key={c}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <BadgeCheck className="size-4 shrink-0 text-primary" />
                {c}
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="mt-auto self-start"
          >
            <Link href="/properties">
              Browse properties <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  )
}
