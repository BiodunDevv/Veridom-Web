"use client"

import * as React from "react"
import Link from "next/link"

import { IconMask } from "@/components/landing/icon-mask"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { KineticText } from "@/components/ui/kinetic-text"

import { AsciiHand } from "./ascii-hand"

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Properties", href: "/properties" },
      { label: "Services", href: "/services" },
      { label: "About us", href: "/about" },
    ],
  },
  {
    title: "Get help",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Send a message", href: "/contact#message" },
      { label: "FAQs", href: "/#faq" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Log in", href: "/?auth=login" },
      { label: "Get started", href: "/?auth=register" },
      { label: "Profile", href: "/account" },
    ],
  },
]

const socials = [
  { label: "LinkedIn", icon: "/landing/social-linkedin.svg" },
  { label: "Twitter", icon: "/landing/social-twitter.svg" },
  { label: "YouTube", icon: "/landing/social-youtube.svg" },
  { label: "Facebook", icon: "/landing/social-facebook.svg" },
]

/** Footer that plays in as it scrolls into view: ASCII hands slide in, the wordmark unmasks, links rise. */
export function SiteFooter() {
  const ref = React.useRef<HTMLElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const rise = (i: number) =>
    ({ transitionDelay: `${150 + i * 90}ms` }) as React.CSSProperties

  return (
    <footer
      id="contact"
      ref={ref}
      className="relative isolate flex min-h-svh scroll-mt-4 flex-col overflow-hidden bg-card lg:h-svh"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col gap-6 px-5 pt-24 pb-4 sm:px-8 lg:gap-4 lg:px-12 lg:pt-28">
        <div className="grid items-center gap-10 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6">
          {/* Africa in ASCII, Nigeria glowing */}
          <figure
            className={cn(
              "mx-auto flex w-full max-w-md flex-col items-center gap-3 transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:h-full lg:min-h-0 lg:max-w-none",
              shown
                ? "translate-x-0 opacity-100"
                : "-translate-x-[60vw] opacity-0"
            )}
          >
            <AsciiHand
              src="/about/africa.png"
              columns={72}
              className="max-h-[60svh] lg:h-0 lg:max-h-none lg:min-h-0 lg:flex-1 lg:object-contain"
            />
            <figcaption className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" />
              Built for Africa, starting in Nigeria
            </figcaption>
          </figure>
          <div className="flex flex-col gap-10">
            <div
              className={cn(
                "flex flex-col items-start gap-4 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight"
              >
                <Logo className="size-8" />
                Veridom
              </Link>
              <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
                Verified homes, tracked payments and one accountable team, from
                the first search to the keys in your hand.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/properties"
                  className={buttonVariants({ size: "lg" })}
                >
                  Explore properties
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  Talk to us
                </Link>
              </div>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
            >
              {columns.map((column, c) => (
                <div
                  key={column.title}
                  className={cn(
                    "flex flex-col gap-3 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                    c === 2 && "col-span-2 sm:col-span-1",
                    shown
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  )}
                  style={rise(c + 1)}
                >
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {column.title}
                  </h3>
                  <ul className="flex flex-col gap-2 text-sm font-semibold">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="inline-block transition-[color,translate] hover:translate-x-0.5 hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Wordmark: letters swell as the cursor passes */}
        <div
          className={cn(
            "overflow-hidden transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            shown ? "translate-y-0" : "translate-y-full"
          )}
          style={{ transitionDelay: "350ms" }}
        >
          <KineticText
            as="p"
            text="VERIDOM"
            className="justify-center text-[clamp(3rem,min(15vw,19svh),12rem)] leading-[0.9] tracking-tighter text-foreground/15 select-none dark:text-foreground/[0.12]"
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t pt-5 text-sm font-medium sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-muted-foreground">
            <p>©2026 Veridom. All rights reserved.</p>
            <Link href="/terms" className="hover:text-primary">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
          </div>
          <div className="flex gap-2">
            {socials.map((social) => (
              <Link
                key={social.label}
                href="#"
                aria-label={social.label}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "rounded-full bg-background"
                )}
              >
                <IconMask src={social.icon} className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
