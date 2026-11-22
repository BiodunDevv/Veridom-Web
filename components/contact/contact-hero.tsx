import { TileArt } from "@/components/site/tile-art"
import Link from "next/link"
import { Clock, Mail, MessageCircle, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Opening of the contact page: pattern texture, response promise and one-tap ways to reach us. */
export function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden border-b bg-linear-to-br from-secondary/80 via-background to-background pb-14 lg:pb-20">
      <TileArt />
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-5 px-4 pt-10 sm:px-8 lg:px-12 lg:pt-16">
        <span className="animate-appear inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Clock className="size-3.5" /> We reply within one working day
        </span>
        <h1 className="animate-appear max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Talk to a real person at Veridom
        </h1>
        <p
          className="animate-appear max-w-2xl text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg"
          style={{ "--appear-delay": "100ms" } as React.CSSProperties}
        >
          Buying, renting, selling or investing? Tell us what you need and our
          team will point you to the right verified home or the right next step.
        </p>
        <div
          className="animate-appear flex flex-wrap gap-3"
          style={{ "--appear-delay": "200ms" } as React.CSSProperties}
        >
          <Button asChild size="lg">
            <Link href="#message">
              <MessageCircle /> Send a message
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="tel:+2348000000000">
              <Phone /> Call us
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="hidden sm:inline-flex"
          >
            <Link href="mailto:hello@veridom.app">
              <Mail /> Email us
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
