"use client"

import * as React from "react"
import Link from "next/link"
import { Cookie } from "lucide-react"

import { Button } from "@/components/ui/button"

const KEY = "veridom-cookie-notice"

/** First-visit cookie notice, bottom left. */
let dismissed = false
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const unanswered = () => {
  if (dismissed) return false
  try {
    return !localStorage.getItem(KEY)
  } catch {
    return true
  }
}

export function CookieNotice() {
  // Server renders nothing; the browser decides after hydration.
  const open = React.useSyncExternalStore(subscribe, unanswered, () => false)

  const accept = () => {
    dismissed = true
    try {
      localStorage.setItem(KEY, "accepted")
    } catch {}
    listeners.forEach((cb) => cb())
  }

  if (!open) return null

  return (
    <section
      role="region"
      aria-label="Cookie notice"
      className="fixed bottom-24 left-4 z-30 flex w-[calc(100vw-2rem)] max-w-sm animate-in flex-col gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-2xl duration-500 fade-in-0 slide-in-from-bottom-6 lg:bottom-6 lg:left-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Cookie className="size-5" />
        </span>
        <div className="grid gap-1">
          <h2 className="text-sm font-semibold">We use cookies</h2>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Veridom uses essential cookies to keep you signed in and your
            account secure. We don&apos;t sell your data. Please allow cookies
            for the best experience.{" "}
            <Link
              href="/privacy#cookies"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-primary"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>
      <Button size="sm" className="w-full" onClick={accept}>
        Allow cookies
      </Button>
    </section>
  )
}
