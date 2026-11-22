import { TileArt } from "@/components/site/tile-art"
import { BadgeCheck, CalendarCheck, ShieldCheck } from "lucide-react"

const trust = [
  { icon: BadgeCheck, text: "Every listing reviewed" },
  { icon: CalendarCheck, text: "Book viewings in taps" },
  { icon: ShieldCheck, text: "Pay securely, held until move-in" },
]

/** Top of the properties page: pattern texture, trust signals, room for the filter bar to overlap. */
export function PropertiesHero() {
  return (
    <section className="relative isolate overflow-hidden border-b bg-linear-to-br from-secondary/80 via-background to-background pb-14 lg:pb-24">
      <TileArt />
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pt-6 sm:px-8 sm:pt-10 lg:px-12 lg:pt-16">
        <span className="animate-appear inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <BadgeCheck className="size-3.5" /> Verified listings only
        </span>
        <h1 className="animate-appear max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Find a home you can trust
        </h1>
        <p
          className="animate-appear max-w-2xl text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg"
          style={{ "--appear-delay": "100ms" } as React.CSSProperties}
        >
          Search by location, type, price and amenities. Our team reviews every
          listing and its documents before it goes live.
        </p>
        <ul
          className="animate-appear mt-1 hidden flex-wrap gap-2 sm:flex"
          style={{ "--appear-delay": "200ms" } as React.CSSProperties}
        >
          {trust.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-sm sm:text-[13px]"
            >
              <Icon className="size-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
