"use client"

import * as React from "react"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Snapshot = { prompt: InstallPromptEvent | null; installed: boolean }

let state: Snapshot = { prompt: null, installed: false }
const listeners = new Set<() => void>()
let started = false

const emit = (next: Partial<Snapshot>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Starts listening once, as early as possible: the browser only fires the install prompt once. */
export function startPwaListeners() {
  if (started || typeof window === "undefined") return
  started = true
  state = { ...state, installed: isStandalone() }
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    emit({ prompt: event as InstallPromptEvent })
  })
  window.addEventListener("appinstalled", () =>
    emit({ prompt: null, installed: true })
  )
  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", () => emit({ installed: isStandalone() }))
}

const subscribe = (listener: () => void) => {
  startPwaListeners()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const serverSnapshot: Snapshot = { prompt: null, installed: false }

export type InstallPlatform = "ios-safari" | "ios-other" | "other"

const noopSubscribe = () => () => {}

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent
  const ios =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (!ios) return "other"
  // Only Safari can add to the home screen on iOS; other iOS browsers can't.
  return /CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua) ? "ios-other" : "ios-safari"
}

export function usePwaInstall() {
  const snap = React.useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot
  )
  const platform = React.useSyncExternalStore(
    noopSubscribe,
    detectPlatform,
    () => "other" as InstallPlatform
  )

  const install = React.useCallback(async () => {
    const event = state.prompt
    if (!event) return null
    await event.prompt()
    const { outcome } = await event.userChoice
    emit({ prompt: null })
    return outcome
  }, [])

  return {
    installed: snap.installed,
    canPrompt: Boolean(snap.prompt),
    platform,
    install,
  }
}
