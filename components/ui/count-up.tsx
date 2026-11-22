"use client"

import * as React from "react"

/** Counts up to a value like "200+" or "10k+" once it scrolls into view. */
export function CountUp({
  value,
  duration = 1400,
}: {
  value: string
  duration?: number
}) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/)
  const target = match ? Number(match[1]) : 0
  const suffix = match ? match[2] : ""
  const ref = React.useRef<HTMLSpanElement>(null)
  const [shown, setShown] = React.useState<number | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !match) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          setShown(Math.round(target * (1 - Math.pow(1 - t, 3))))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span ref={ref}>
      {shown ?? target}
      {suffix}
    </span>
  )
}
