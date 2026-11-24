"use client"

import * as React from "react"

import type { ListingDetail } from "@/lib/api/listings"
import { formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Rolls the price into place the first time it appears (skipped for reduced motion). */
function useRolling(target: number) {
  const [shown, setShown] = React.useState(target)
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const start = performance.now()
    const from = target * 0.8
    const tick = (now: number) => {
      const t = Math.min((now - start) / 700, 1)
      setShown(Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return shown
}

/** The headline price with its period: "₦938,947,474 / month". */
export function PriceTag({
  listing,
  className,
}: {
  listing: Pick<ListingDetail, "listingType" | "rentPeriod" | "priceKobo">
  className?: string
}) {
  const rolling = useRolling(listing.priceKobo)
  const rent = listing.listingType === "RENT"
  const period = listing.rentPeriod === "MONTH" ? "month" : "year"

  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 sm:justify-end",
        className
      )}
    >
      <span
        className="text-3xl leading-none font-semibold tracking-tight tabular-nums sm:text-4xl"
        aria-label={`${formatNaira(listing.priceKobo)}${rent ? ` per ${period}` : ""}`}
      >
        {formatNaira(rolling)}
      </span>
      <span className="text-sm font-medium text-muted-foreground">
        {rent ? `/ ${period}` : "asking price"}
      </span>
    </p>
  )
}
