"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ListerShortcutButton } from "@/components/account/lister-shortcut"
import { useAuthModal } from "@/components/auth/auth-modal"
import { Logo } from "@/components/logo"
import { MessagesButton } from "@/components/chat/messages-button"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ThemeToggleButton } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { initialsOf } from "@/lib/initials"
import { useMe } from "@/features/auth/hooks"
import { cn } from "@/lib/utils"

import { GuestMenu } from "./guest-menu"
import { MarqueeBanner } from "./marquee-banner"
import { PublicDock } from "./public-dock"
import { navLinks } from "./nav"
import { SmoothScroll } from "./smooth-scroll"

function ProfileButton({ name, initials }: { name: string; initials: string }) {
  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="hidden gap-2 pl-1.5 lg:inline-flex"
    >
      <Link href="/account" aria-label={`Profile of ${name}`}>
        <span className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {initials}
        </span>
        Profile
      </Link>
    </Button>
  )
}

export function SiteHeader({ dock = true }: { dock?: boolean }) {
  const pathname = usePathname()
  // Browsing is public; this only decides between auth buttons and "My account".
  const me = useMe().data
  const auth = useAuthModal()

  const openAuth = (view: "login" | "register") => {
    auth.open(view)
  }

  return (
    <>
      {/* The header sticks 2rem above the viewport, so the banner scrolls away
          with the page and only the main bar stays. No JS and no layout change,
          which is what made the old collapse flicker on mobile. */}
      <header className="sticky top-[-2rem] z-40 shrink-0 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <SmoothScroll />
        <MarqueeBanner />
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
              {me ? (
                <>
                  <MessagesButton side="customer" />
                  <NotificationBell />
                </>
              ) : null}
              <ThemeToggleButton className="size-7 p-1.5 sm:size-8 sm:p-1.5 lg:size-9 lg:p-2" />
              {me ? (
                <>
                  <ListerShortcutButton />
                  <ProfileButton
                    name={me.firstName}
                    initials={initialsOf(me.firstName, me.lastName)}
                  />
                  {/* No tab bar on marketing pages, so the menu is how you get around. */}
                  {dock && !pathname.startsWith("/properties") ? (
                    <GuestMenu signedIn />
                  ) : null}
                </>
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
                  <GuestMenu />
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {dock && me ? <PublicDock /> : null}
    </>
  )
}
