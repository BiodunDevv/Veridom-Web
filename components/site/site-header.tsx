"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { IconMask } from "@/components/landing/icon-mask"
import { Logo } from "@/components/logo"
import { ThemeToggleButton } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { navLinks } from "./nav"

function AnnouncementBanner() {
  const [open, setOpen] = React.useState(true)

  if (!open) return null

  return (
    <div className="relative bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 px-12 py-2.5 text-[12px] font-medium sm:text-sm">
        <p className="truncate">
          ✨ Discover Your Dream Property<span className="hidden sm:inline"> with Veridom</span>
        </p>
        <Link href="/properties" className="shrink-0 underline underline-offset-2">
          Learn More
        </Link>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-foreground/10 sm:right-6"
        aria-label="Dismiss announcement"
        onClick={() => setOpen(false)}
      >
        <IconMask src="/landing/icon-close.svg" className="size-4" />
      </Button>
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="relative z-30 shrink-0 bg-background">
      <AnnouncementBanner />
      <div className="border-b">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:h-16 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-md text-xl font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo className="size-8" />
            Veridom
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Button
                  key={link.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(!active && "text-muted-foreground")}
                >
                  <Link href={link.href} aria-current={active ? "page" : undefined}>
                    {link.label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggleButton className="size-9" />
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggleButton className="size-9" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <IconMask src="/landing/icon-menu.svg" className="size-7" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="gap-0 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 p-4 pt-16">
                {navLinks.map((link) => {
                  const active = pathname === link.href
                  return (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-3 text-base font-medium",
                          active ? "bg-secondary" : "text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
              <div className="flex flex-col gap-3 border-t p-4">
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild size="lg">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
