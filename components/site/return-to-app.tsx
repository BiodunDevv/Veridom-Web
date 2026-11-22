"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  CalendarCheck,
  Handshake,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { useMe } from "@/features/auth/hooks"
import { cn } from "@/lib/utils"

const KEY = "veridom:last-app-path"
const MARKETING = ["/about", "/services", "/contact", "/terms", "/privacy"]

const isApp = (p: string) =>
  p.startsWith("/properties") ||
  (p.startsWith("/account") && !p.startsWith("/account/messages/"))
const isMarketing = (p: string) =>
  p === "/" || MARKETING.some((m) => p === m || p.startsWith(`${m}/`))

const describe = (path: string): { label: string; icon: LucideIcon } => {
  if (path.startsWith("/properties")) return { label: "Explore", icon: Search }
  if (path.startsWith("/account/deals"))
    return { label: "Deals", icon: Handshake }
  if (path.startsWith("/account/viewings"))
    return { label: "Viewings", icon: CalendarCheck }
  return { label: "Profile", icon: UserRound }
}

const noopSubscribe = () => () => {}

const read = () => {
  try {
    return sessionStorage.getItem(KEY) || "/account"
  } catch {
    return "/account"
  }
}

/**
 * Marketing pages have no tab bar, so a signed-in visitor on a phone gets a
 * small floating way back to where they were in the app. It starts expanded
 * ("Back to Explore") and folds into an icon once they scroll.
 */
export function ReturnToApp() {
  const pathname = usePathname()
  const me = useMe().data
  const [compact, setCompact] = React.useState(false)
  const target = React.useSyncExternalStore(
    noopSubscribe,
    read,
    () => "/account"
  )

  // Remember the last app page, wherever it is.
  React.useEffect(() => {
    if (!isApp(pathname)) return
    try {
      sessionStorage.setItem(KEY, pathname)
    } catch {
      // private mode: the default still works
    }
  }, [pathname])

  React.useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  if (!me || !isMarketing(pathname)) return null
  const { label, icon: Icon } = describe(target)

  return (
    <Link
      href={target}
      aria-label={`Back to ${label}`}
      className={cn(
        "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex animate-in items-center gap-2 rounded-full border border-primary/30 bg-primary py-2.5 pr-4 pl-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--primary)_70%,transparent)] transition-[padding,gap] duration-500 fade-in-0 outline-none slide-in-from-bottom-6 focus-visible:ring-4 focus-visible:ring-ring/50 active:scale-95 lg:hidden",
        compact && "gap-0 p-3"
      )}
    >
      <span className="relative grid size-5 place-items-center">
        {compact ? (
          <Icon className="size-5" aria-hidden />
        ) : (
          <ArrowLeft className="size-5" aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300",
          compact ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
        )}
      >
        Back to {label}
      </span>
    </Link>
  )
}
