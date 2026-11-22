"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleCheck,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { investing, management, selling } from "./service-groups"

type Pillar = {
  id: string
  label: string
  icon: LucideIcon
  line: string
  title: string
  body: string
  points: string[]
  items: typeof selling
}

const pillars: Pillar[] = [
  {
    id: "sell",
    label: "Sell",
    icon: Building2,
    line: "Get the best price",
    title: "Unlock the value of your property",
    body: "From a fair valuation to a safe closing, we market your property to verified buyers and keep every step on record.",
    points: ["Expert valuation", "Verified buyers only", "Tracked payments"],
    items: selling,
  },
  {
    id: "manage",
    label: "Manage",
    icon: KeyRound,
    line: "Stay hands-off",
    title: "Property management without the stress",
    body: "Tenants, upkeep, rent collection and compliance, handled by a team you can see and hold to account.",
    points: [
      "Screened tenants",
      "Rent collected on time",
      "Clear monthly reports",
    ],
    items: management,
  },
  {
    id: "invest",
    label: "Invest",
    icon: TrendingUp,
    line: "Grow your portfolio",
    title: "Invest with confidence",
    body: "Market insight, return assessments and strategies built around your goals and appetite for risk.",
    points: ["Market analysis", "ROI modelling", "Diversified portfolios"],
    items: investing,
  },
]

export function ServicesExplorer() {
  const [active, setActive] = React.useState(pillars[0].id)
  const pillar = pillars.find((p) => p.id === active) ?? pillars[0]

  return (
    <Section id="explore" className="scroll-mt-28">
      <div
        role="tablist"
        aria-label="Service areas"
        className="grid gap-3 sm:grid-cols-3"
      >
        {pillars.map((p) => {
          const on = p.id === active
          return (
            <button
              key={p.id}
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={on}
              aria-controls={`panel-${p.id}`}
              onClick={() => setActive(p.id)}
              className={cn(
                "group flex items-center gap-4 rounded-2xl p-4 text-left shadow-md transition-[background-color,translate,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                on
                  ? "bg-primary text-primary-foreground shadow-xl"
                  : "bg-card hover:-translate-y-0.5 hover:shadow-xl"
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl transition-colors",
                  on
                    ? "bg-primary-foreground/15"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                )}
              >
                <p.icon className="size-6" />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-semibold">{p.label}</span>
                <span
                  className={cn(
                    "text-sm",
                    on ? "opacity-85" : "text-muted-foreground"
                  )}
                >
                  {p.line}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        key={pillar.id}
        role="tabpanel"
        id={`panel-${pillar.id}`}
        aria-labelledby={`tab-${pillar.id}`}
        className="grid animate-in gap-4 duration-500 fade-in-0 slide-in-from-bottom-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6"
      >
        <aside className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-md sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              {pillar.title}
            </h2>
            <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
              {pillar.body}
            </p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {pillar.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2.5 text-sm font-semibold"
              >
                <CircleCheck className="size-5 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Button asChild size="lg">
              <Link href="/contact#message">
                Talk to our team <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/properties">Browse properties</Link>
            </Button>
          </div>
        </aside>

        <ul className="grid gap-3 sm:grid-cols-2">
          {pillar.items.map((item, i) => (
            <li
              key={item.title}
              className="animate-in duration-500 fade-in-0 fill-mode-both slide-in-from-bottom-2"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <article className="group flex h-full flex-col gap-3 rounded-2xl bg-card p-5 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl">
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <IconMask src={item.icon} className="size-6" />
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                  {item.body}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

const steps = [
  ["Tell us your goal", "Share what you want to sell, manage or invest in."],
  ["We verify", "Documents, ownership and details are checked first."],
  ["We take action", "Listing, viewings, tenants or analysis begin."],
  ["You stay informed", "Every payment and update is tracked for you."],
] as const

const why: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: BadgeCheck,
    title: "Verified, always",
    text: "Every listing and lister is reviewed before it goes live.",
  },
  {
    icon: ShieldCheck,
    title: "Money held safely",
    text: "Payments are held until the keys change hands.",
  },
  {
    icon: KeyRound,
    title: "One accountable team",
    text: "A named team from first call to final handover.",
  },
]

export function ServicesProcess() {
  return (
    <Section id="process" className="bg-muted/60">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <p className="max-w-2xl text-sm font-medium text-muted-foreground sm:text-base">
          Four clear steps, the same for every service.
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([title, text], i) => (
          <li
            key={title}
            className="relative flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md"
          >
            <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
      <ul className="mt-2 grid gap-4 md:grid-cols-3">
        {why.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-start gap-4 rounded-2xl bg-card p-5 shadow-md"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="block text-sm text-muted-foreground">
                {text}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
