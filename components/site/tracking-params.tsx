"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { isTrackingParam, readStored, writeStored } from "@/lib/tracking/params"

/** Keeps utm_*, gclid and similar params on the URL as people move around. */
function Persist() {
  const pathname = usePathname()
  const search = useSearchParams()

  React.useEffect(() => {
    const current = new URLSearchParams(search.toString())
    const stored = readStored()

    // New tracking params in the URL win and are remembered for the visit.
    let changed = false
    current.forEach((value, key) => {
      if (isTrackingParam(key) && stored[key] !== value) {
        stored[key] = value
        changed = true
      }
    })
    if (changed) writeStored(stored)

    // Add back anything the current URL lost.
    let missing = false
    for (const [key, value] of Object.entries(stored)) {
      if (!current.has(key)) {
        current.set(key, value)
        missing = true
      }
    }
    if (!missing) return

    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}?${current.toString()}${window.location.hash}`
    )
  }, [pathname, search])

  return null
}

export function TrackingParams() {
  return (
    <React.Suspense fallback={null}>
      <Persist />
    </React.Suspense>
  )
}
