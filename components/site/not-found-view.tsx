"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Compass, Home, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { PatternBg } from "@/components/ui/pattern-bg"

const QUICK_LINKS = [
  { href: "/properties", label: "Browse properties" },
  { href: "/services", label: "Our services" },
  { href: "/about", label: "About Veridom" },
  { href: "/contact", label: "Contact us" },
]

/**
 * Icons8 "trail map" (3D Casual life): a route through the city that ends at
 * a question mark. The map drifts gently and a ring pulses under the "?" pin;
 * both stop for people who ask for reduced motion.
 */
function LostMap() {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="relative motion-safe:animate-float">
        <Image
          src="/illustrations/not-found-map.png"
          width={900}
          height={429}
          priority
          sizes="(min-width: 1024px) 480px, 92vw"
          alt="A city map with a route that ends at a question mark"
          className="h-auto w-full drop-shadow-[0_18px_24px_rgb(0_0_0/0.12)] dark:drop-shadow-[0_18px_28px_rgb(0_0_0/0.45)]"
        />
        {/* where the address should have been */}
        <span
          aria-hidden
          className="absolute top-[53%] left-[18.8%] -translate-x-1/2 -translate-y-1/2"
        >
          <span className="block h-3 w-7 rounded-[50%] bg-pink-400/60 motion-safe:animate-ping" />
        </span>
        {/* the destination the route never reaches */}
        <span
          aria-hidden
          className="absolute top-[28%] left-[75.2%] -translate-x-1/2 -translate-y-1/2"
        >
          <span className="block h-2.5 w-6 rounded-[50%] bg-sky-400/50 [animation-delay:1.2s] motion-safe:animate-ping" />
        </span>
      </div>
      {/* ground shadow, so the floating map has something to float over */}
      <div
        aria-hidden
        className="mx-auto -mt-2 h-4 w-3/5 rounded-[50%] bg-foreground/10 blur-md dark:bg-black/50"
      />
    </div>
  )
}

export function NotFoundView() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    router.push(q ? `/properties?q=${encodeURIComponent(q)}` : "/properties")
  }

  return (
    <section className="relative isolate overflow-hidden">
      <PatternBg className="[mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)] opacity-20 dark:opacity-40" />
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-12 lg:py-28">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Compass className="size-3.5 text-primary" aria-hidden />
            Error 404
          </span>

          <h1 className="flex items-center gap-1 text-[clamp(5.5rem,18vw,10rem)] leading-none font-semibold tracking-tighter text-foreground select-none">
            <span>4</span>
            <span className="relative grid place-items-center">
              <span className="absolute size-[0.62em] animate-twinkle rounded-full bg-primary/15 blur-xl" />
              <MapPin
                aria-hidden
                strokeWidth={1.6}
                className="size-[0.8em] animate-float text-primary"
              />
            </span>
            <span>4</span>
          </h1>

          <div className="flex max-w-md flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              This address doesn&apos;t exist
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              The page you&apos;re looking for was moved, removed or never
              listed. Search for a home instead, or head back somewhere
              familiar.
            </p>
          </div>

          <form onSubmit={submit} className="w-full max-w-md" role="search">
            <label htmlFor="nf-search" className="sr-only">
              Search properties
            </label>
            <InputGroup className="h-12 rounded-xl bg-background shadow-xs dark:bg-foreground/[0.04]">
              <InputGroupAddon align="inline-start" className="pl-3.5">
                <Search
                  aria-hidden
                  className="size-[18px] text-foreground/45"
                />
              </InputGroupAddon>
              <InputGroupInput
                id="nf-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a neighbourhood or city"
                className="h-full text-[15px] md:text-[15px]"
              />
              <InputGroupAddon align="inline-end" className="pr-1.5">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="sm"
                  className="h-9 rounded-lg px-4"
                >
                  Search
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button asChild>
              <Link href="/">
                <Home className="size-4" aria-hidden />
                Back to home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" aria-hidden />
              Go back
            </Button>
          </div>

          <nav
            aria-label="Helpful links"
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm lg:justify-start"
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute inset-6 -z-10 rounded-full bg-primary/10 blur-3xl" />
          <LostMap />
        </div>
      </div>
    </section>
  )
}
