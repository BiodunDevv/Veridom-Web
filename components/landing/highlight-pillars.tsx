"use client"

import * as React from "react"
import {
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type Pillar = {
  icon: LucideIcon
  title: string
  text: string
}

const items: Pillar[] = [
  {
    icon: BadgeCheck,
    title: "Verified listings",
    text: "Every property is reviewed by our team before it goes live.",
  },
  {
    icon: CalendarCheck,
    title: "Guided viewings",
    text: "Book a slot, inspect with an agent and confirm what you saw.",
  },
  {
    icon: ShieldCheck,
    title: "Secure deals",
    text: "Reserve and pay through Veridom, with every step on record.",
  },
  {
    icon: Wallet,
    title: "Clear payouts",
    text: "Owners and agents are paid once the deal is confirmed.",
  },
]

/** Cells with one highlight that glides to the hovered cell. */
export function HighlightPillars() {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState<{
    x: number
    y: number
    w: number
    h: number
  } | null>(null)

  const move = (el: HTMLElement) => {
    const root = rootRef.current
    if (!root) return
    const r = root.getBoundingClientRect()
    const c = el.getBoundingClientRect()
    setBox({ x: c.left - r.left, y: c.top - r.top, w: c.width, h: c.height })
  }

  return (
    <div
      ref={rootRef}
      onPointerLeave={() => setBox(null)}
      className="relative grid grid-cols-1 gap-2 rounded-2xl bg-card p-2 shadow-md sm:grid-cols-2 lg:grid-cols-4"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 hidden rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-[transform,width,height,opacity] duration-300 ease-out sm:block",
          box ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: box?.w ?? 0,
          height: box?.h ?? 0,
          transform: `translate(${box?.x ?? 0}px, ${box?.y ?? 0}px)`,
        }}
      />
      {items.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          tabIndex={0}
          onPointerEnter={(e) => move(e.currentTarget)}
          onFocus={(e) => move(e.currentTarget)}
          onBlur={() => setBox(null)}
          className="group relative flex flex-col gap-3 rounded-xl p-5 outline-none"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-5" />
          </span>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed font-medium text-muted-foreground">
            {text}
          </p>
        </div>
      ))}
    </div>
  )
}
