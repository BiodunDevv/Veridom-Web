"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Clock, Copy, Mail, MapPin, Phone } from "lucide-react"

import { cn } from "@/lib/utils"

const cards = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@veridom.app",
    href: "mailto:hello@veridom.app",
    hint: "Replies within a day",
    copy: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
    hint: "Mon to Fri, 9am to 6pm",
    copy: true,
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "Lagos, Nigeria",
    href: "#offices",
    hint: "See all offices",
  },
  {
    icon: Clock,
    label: "Office hours",
    value: "Mon to Fri, 9am to 6pm",
    hint: "West Africa Time",
  },
] as const

const socials = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Facebook", href: "#" },
]

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = React.useState(false)

  return (
    <button
      type="button"
      aria-label={`Copy ${text}`}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1600)
        } catch {
          // clipboard unavailable
        }
      }}
      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {done ? (
        <Check className="size-4 text-primary" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  )
}

export function ContactStrip() {
  return (
    <section
      aria-label="Contact details"
      className="relative z-10 mx-auto -mt-8 grid max-w-[1280px] gap-3 px-4 sm:grid-cols-2 sm:px-8 lg:-mt-10 lg:grid-cols-4 lg:px-12"
    >
      {cards.map((card) => {
        const body = (
          <>
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <card.icon className="size-5" />
              </span>
              {"copy" in card && card.copy ? (
                <CopyButton text={card.value} />
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {card.label}
              </p>
              <p className="text-base font-semibold break-all">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            </div>
          </>
        )
        const cls =
          "group flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md outline-none"
        return "href" in card && card.href ? (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              cls,
              "transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          >
            {body}
          </Link>
        ) : (
          <div key={card.label} className={cls}>
            {body}
          </div>
        )
      })}
      <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">
        Find us on{" "}
        {socials.map((s, i) => (
          <React.Fragment key={s.label}>
            <Link
              href={s.href}
              className="font-semibold text-foreground underline underline-offset-2 hover:text-primary"
            >
              {s.label}
            </Link>
            {i < socials.length - 1 ? ", " : "."}
          </React.Fragment>
        ))}
      </p>
    </section>
  )
}
