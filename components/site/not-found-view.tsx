"use client"

import * as React from "react"
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

/** A map that lost its destination: the route runs out before the pin. */
function LostMap() {
  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label="A route that stops before reaching its destination"
      className="h-auto w-full max-w-[420px]"
    >
      <defs>
        <pattern
          id="nf-grid"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 0H0V28"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
          />
        </pattern>
        <radialGradient id="nf-fade" cx="50%" cy="50%" r="60%">
          <stop offset="55%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="nf-mask">
          <rect width="420" height="300" fill="url(#nf-fade)" />
        </mask>
      </defs>

      <g mask="url(#nf-mask)" className="text-foreground">
        <rect width="420" height="300" fill="url(#nf-grid)" />
        <path
          d="M0 210C70 190 110 240 190 215S320 150 420 170"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="14"
        />
        <path
          d="M90 0C100 80 70 130 120 300"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="10"
        />
      </g>

      {/* the route that never arrives */}
      <path
        d="M56 244C96 226 118 196 154 190S226 196 254 160"
        fill="none"
        className="animate-draw stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        style={{ strokeDasharray: "1", strokeDashoffset: 1 }}
      />
      <circle cx="56" cy="244" r="6" className="fill-primary" />
      <circle cx="56" cy="244" r="12" className="fill-primary/20" />

      {/* question mark where the road ends */}
      <g className="animate-twinkle" style={{ transformOrigin: "266px 146px" }}>
        <circle
          cx="266"
          cy="146"
          r="15"
          className="fill-background stroke-primary/50"
          strokeDasharray="3 4"
        />
        <text
          x="266"
          y="152"
          textAnchor="middle"
          className="fill-primary text-[16px] font-semibold"
        >
          ?
        </text>
      </g>

      {/* the missing pin floats off to the side */}
      <g className="animate-float">
        <ellipse
          cx="338"
          cy="104"
          rx="14"
          ry="4"
          className="fill-foreground/10"
        />
        <path
          d="M338 62c-11 0-20 8.500-20 19 0 14 20 32 20 32s20-18 20-32c0-10.500-9-19-20-19Z"
          className="fill-primary"
          transform="translate(0 -24)"
        />
        <circle cx="338" cy="57" r="7" className="fill-primary-foreground" />
      </g>
    </svg>
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
          <div className="w-full max-w-[460px] rounded-3xl border bg-card/60 p-4 shadow-sm backdrop-blur">
            <LostMap />
          </div>
        </div>
      </div>
    </section>
  )
}
