"use client"

import * as React from "react"

import { startPwaListeners } from "@/hooks/use-pwa-install"

/** Registers the service worker and starts capturing the install prompt. */
export function PwaRegister() {
  React.useEffect(() => {
    startPwaListeners()
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined)
    }
  }, [])
  return null
}
