"use client"

import * as React from "react"
import Link from "next/link"
import { Building2, CalendarCheck, LayoutGrid, Wallet } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Section } from "./section"

const categories = [
  { id: "all", label: "All topics", icon: LayoutGrid },
  { id: "buying", label: "Buying & renting", icon: Building2 },
  { id: "viewings", label: "Viewings", icon: CalendarCheck },
  { id: "payments", label: "Payments", icon: Wallet },
] as const

const faqs = [
  {
    id: "search",
    category: "buying",
    q: "How do I search for properties on Veridom?",
    a: "Use the Properties page to filter by location, type, price and amenities. Every result is a verified listing, and you can browse without an account.",
  },
  {
    id: "verified",
    category: "buying",
    q: "What does a verified listing mean?",
    a: "Our team reviews ownership documents, photos, price and location before a listing is published, so what you see is what you get.",
  },
  {
    id: "sell",
    category: "buying",
    q: "What do I need to list my property?",
    a: "Create a lister account, add your property details and photos, and upload supporting documents. We review it and let you know when it goes live.",
  },
  {
    id: "book",
    category: "viewings",
    q: "How do I book a viewing?",
    a: "Open a listing, pick an available slot and confirm. You can reschedule or cancel from My Account before the viewing time.",
  },
  {
    id: "contact",
    category: "viewings",
    q: "How can I contact a Veridom agent?",
    a: "Use the Contact page or message through your viewing or deal. An agent will respond with next steps.",
  },
  {
    id: "reserve",
    category: "payments",
    q: "How does reserving a property work?",
    a: "Reserve from the listing and pay securely through Veridom. Your deal tracks every step until the handover is confirmed.",
  },
  {
    id: "refund",
    category: "payments",
    q: "What if the deal does not go ahead?",
    a: "You can cancel or dispute a deal from your account. Our team reviews it and any refund due is processed back to you.",
  },
]

export function Faq() {
  const [active, setActive] = React.useState<string>("all")
  const items = faqs.filter((f) => active === "all" || f.category === active)

  return (
    <Section id="faq">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
              Quick answers about searching, viewings and secure deals on
              Veridom.
            </p>
          </div>
          <div
            role="tablist"
            aria-label="FAQ topics"
            className="flex flex-wrap gap-2 lg:flex-col lg:items-start"
          >
            {categories.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                role="tab"
                aria-selected={active === id}
                size="sm"
                variant={active === id ? "default" : "outline"}
                onClick={() => setActive(id)}
                className={cn(active !== id && "bg-card")}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
          <div className="hidden flex-col gap-2 rounded-2xl bg-card p-5 shadow-md lg:flex">
            <p className="text-sm font-semibold">Still have questions?</p>
            <p className="text-sm font-medium text-muted-foreground">
              Our team replies quickly and is happy to help.
            </p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="mt-1 self-start"
            >
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
        <Accordion
          key={active}
          type="single"
          collapsible
          defaultValue={items[0]?.id}
          className="gap-3"
        >
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-xl border-0 bg-card px-5 shadow-md"
            >
              <AccordionTrigger className="py-4 text-left text-base font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed font-medium text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-5 shadow-md lg:hidden">
          <p className="text-sm font-semibold">Still have questions?</p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </Section>
  )
}
