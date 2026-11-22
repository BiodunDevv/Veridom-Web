"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { useAuthModal } from "@/components/auth/auth-modal"
import { Logo } from "@/components/logo"
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

/**
 * Full-screen menu on phones for marketing pages. Signed-in people get a way
 * into their profile instead of the sign-up buttons.
 */
export function GuestMenu({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname()
  const auth = useAuthModal()
  const [open, setOpen] = React.useState(false)

  const openAuth = (view: "login" | "register") => {
    setOpen(false)
    auth.open(view)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        data-lenis-prevent
        className="gap-0 bg-background p-0 data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:duration-500 data-[side=right]:ease-[cubic-bezier(0.16,1,0.3,1)] data-[side=right]:sm:max-w-none data-[side=right]:data-open:slide-in-from-right-full data-[side=right]:data-closed:slide-out-to-right-full"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <div className="flex h-14 items-center justify-between border-b px-4 sm:px-8">
          <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Logo className="size-7" />
            Veridom
          </span>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close menu">
              <X className="size-6" />
            </Button>
          </SheetClose>
        </div>
        <nav
          aria-label="Mobile"
          className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-4 sm:px-8"
        >
          {navLinks.map((link, i) => {
            const active = pathname === link.href
            return (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  style={{ animationDelay: `${150 + i * 70}ms` }}
                  className={cn(
                    "flex animate-in items-center justify-between rounded-2xl px-4 py-4 text-3xl font-semibold tracking-tight duration-500 fade-in-0 fill-mode-both slide-in-from-right-8",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                  {active ? (
                    <span className="size-2 rounded-full bg-primary" />
                  ) : null}
                </Link>
              </SheetClose>
            )
          })}
        </nav>
        <div className="flex flex-col gap-3 border-t p-4 sm:p-8">
          {signedIn ? (
            <>
              <SheetClose asChild>
                <Button asChild size="lg">
                  <Link href="/account">My profile</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="outline" size="lg">
                  <Link href="/properties">Browse properties</Link>
                </Button>
              </SheetClose>
            </>
          ) : (
            <>
              <Button size="lg" onClick={() => openAuth("register")}>
                Get started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => openAuth("login")}
              >
                Log in
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
