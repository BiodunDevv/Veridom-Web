"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  Handshake,
  MessageSquare,
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
  p.startsWith("/account") ||
  p.startsWith("/lister")
const isMarketing = (p: string) =>
  p === "/" || MARKETING.some((m) => p === m || p.startsWith(`${m}/`))

const describe = (path: string): { label: string; icon: LucideIcon } => {
  if (path.startsWith("/properties")) return { label: "Explore", icon: Search }
  if (path.startsWith("/account/deals"))
    return { label: "Deals", icon: Handshake }
  if (path.startsWith("/account/viewings"))
    return { label: "Viewings", icon: CalendarCheck }
  if (path.startsWith("/account/messages"))
    return { label: "Chats", icon: MessageSquare }
  if (path.startsWith("/lister"))
    return { label: "Lister area", icon: Building2 }
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
 * glass pill in the same style as the tab bar: it names the section they came
 * from and takes them straight back. It folds into just the icon on scroll.
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
    <nav
      aria-label="Back to the app"
      className="pointer-events-none fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] z-40 flex justify-end lg:hidden"
    >
      <Link
        href={target}
        aria-label={`Back to ${label}`}
        className={cn(
          "group pointer-events-auto flex w-auto animate-in items-center gap-3 overflow-hidden rounded-full border bg-background/75 p-1.5 pr-5 shadow-2xl ring-1 shadow-black/10 ring-foreground/5 backdrop-blur-xl transition-[padding,gap] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] fade-in-0 outline-none slide-in-from-bottom-8 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 supports-[backdrop-filter]:bg-background/60",
          compact && "gap-0 pr-1.5"
        )}
      >
        {/* The same glass bubble the tab bar uses for the active tab. */}
        <span
          className="relative grid h-10 w-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-1 ring-white/30"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgb(255 255 255 / 0.28), transparent 55%)",
          }}
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 [animation-duration:2.6s] motion-safe:animate-ping" />
          <span className="relative grid place-items-center">
            {compact ? (
              <Icon className="size-5" aria-hidden />
            ) : (
              <ArrowLeft
                className="size-5 motion-safe:animate-[nudge_1.6s_ease-in-out_infinite]"
                aria-hidden
              />
            )}
          </span>
        </span>
        <span
          className={cn(
            "flex flex-col overflow-hidden text-left whitespace-nowrap transition-[max-width,opacity] duration-300",
            compact ? "max-w-0 opacity-0" : "max-w-56 opacity-100"
          )}
        >
          <span className="text-[11px] leading-none font-medium text-muted-foreground">
            Continue where you left off
          </span>
          <span className="mt-1 text-sm leading-none font-semibold">
            Back to {label}
          </span>
        </span>
      </Link>
    </nav>
  )
}
