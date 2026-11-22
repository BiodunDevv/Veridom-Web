"use client"

import Link from "next/link"

import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { IconMask } from "@/components/landing/icon-mask"

const columns = [
  {
    title: "Home",
    links: ["Hero Section", "Features", "Properties", "Why Veridom", "FAQ’s"],
  },
  {
    title: "About Us",
    links: [
      "Our Story",
      "Our Works",
      "How It Works",
      "Our Team",
      "Our Clients",
    ],
  },
  { title: "Properties", links: ["Portfolio", "Categories"] },
  {
    title: "Services",
    links: [
      "Valuation Mastery",
      "Strategic Marketing",
      "Negotiation Wizardry",
      "Closing Success",
      "Property Management",
    ],
  },
  { title: "Contact Us", links: ["Contact Form", "Our Offices"] },
]

const socials = [
  { label: "LinkedIn", icon: "/landing/social-linkedin.svg" },
  { label: "Twitter", icon: "/landing/social-twitter.svg" },
  { label: "YouTube", icon: "/landing/social-youtube.svg" },
  { label: "Facebook", icon: "/landing/social-facebook.svg" },
]

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-4">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:gap-16 lg:px-12 lg:py-12">
        <div className="flex w-full flex-col gap-5 lg:w-[300px] lg:shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight"
          >
            <Logo className="size-8" />
            Veridom
          </Link>
          <form className="relative" action="#">
            <IconMask
              src="/landing/icon-mail.svg"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="email"
              placeholder="Enter Your Email"
              aria-label="Email address"
              className="h-11 pr-12 pl-9"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Subscribe"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 text-primary"
            >
              <IconMask src="/landing/icon-send.svg" className="size-5" />
            </Button>
          </form>
        </div>

        <nav
          aria-label="Footer"
          className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5"
        >
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3 className="font-medium text-muted-foreground">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5 text-sm font-medium">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="hover:text-primary">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="bg-secondary">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-5 py-3 text-sm font-medium sm:flex-row sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <p>©2026 Veridom. All Rights Reserved.</p>
            <Link href="#" className="hover:text-primary">
              Terms &amp; Conditions
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
