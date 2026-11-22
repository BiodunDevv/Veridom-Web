"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useAuthModal } from "@/components/auth/auth-modal"
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
import { initialsOf } from "@/lib/initials"
import { useMe } from "@/features/auth/hooks"
import { cn } from "@/lib/utils"

import { MarqueeBanner } from "./marquee-banner"
import { navLinks } from "./nav"
import { SmoothScroll } from "./smooth-scroll"

/** True once the page is scrolled away from the top. */
function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [offset])

  return scrolled
}

function ProfileButton({ name, initials }: { name: string; initials: string }) {
  return (
    <Button asChild size="sm" variant="outline" className="gap-2 pl-1.5">
      <Link href="/account" aria-label={`Profile of ${name}`}>
        <span className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {initials}
        </span>
        Profile
      </Link>
    </Button>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  // Browsing is public; this only decides between auth buttons and "My account".
  const me = useMe().data
  const auth = useAuthModal()
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const openAuth = (view: "login" | "register") => {
    setMenuOpen(false)
    auth.open(view)
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <SmoothScroll />
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          scrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
      >
        <div className="overflow-hidden">
          <MarqueeBanner />
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:h-16 lg:gap-6 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-2.5 sm:text-xl"
          >
            <Logo className="size-7 sm:size-8" />
            Veridom
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
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
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            <ThemeToggleButton className="size-7 p-1.5 sm:size-8 sm:p-1.5 lg:size-9 lg:p-2" />
            {me ? (
              <ProfileButton
                name={me.firstName}
                initials={initialsOf(me.firstName, me.lastName)}
              />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:inline-flex"
                  onClick={() => openAuth("login")}
                >
                  Log in
                </Button>
                <Button size="sm" onClick={() => openAuth("register")}>
                  Get started
                </Button>
              </>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 lg:hidden"
                  aria-label="Open menu"
                >
                  <IconMask src="/landing/icon-menu.svg" className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                showCloseButton={false}
                data-lenis-prevent
                className="gap-0 bg-background p-0 data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:duration-500 data-[side=right]:ease-[cubic-bezier(0.16,1,0.3,1)] data-[side=right]:sm:max-w-none data-[side=right]:data-open:slide-in-from-right-full data-[side=right]:data-closed:slide-out-to-right-full"
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
                <div className="flex h-14 items-center justify-between border-b px-4 sm:px-8">
                  <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <Logo className="size-7" />
                    Veridom
                  </span>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <IconMask
                        src="/landing/icon-close.svg"
                        className="size-6"
                      />
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
                  {me ? (
                    <SheetClose asChild>
                      <Button asChild size="lg">
                        <Link href="/account">
                          <span className="grid size-6 place-items-center rounded-full bg-primary-foreground/20 text-[11px] font-semibold">
                            {initialsOf(me.firstName, me.lastName)}
                          </span>
                          Profile
                        </Link>
                      </Button>
                    </SheetClose>
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
          </div>
        </div>
      </div>
    </header>
  )
}
