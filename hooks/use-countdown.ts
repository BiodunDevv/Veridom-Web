import * as React from "react"

/** Seconds left until an ISO time, ticking once a second. */
export function useCountdown(iso?: string | null) {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!iso) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [iso])

  return iso
    ? Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000))
    : 0
}

export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
