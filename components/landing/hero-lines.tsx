"use client"

import * as React from "react"
import { useTheme } from "next-themes"

type Ripple = { x: number; y: number; t: number }

const STEP = 8
const MAX_RIPPLES = 14

/** The Figma contour lines, drawn on a canvas that ripples under the cursor. */
export function HeroLines() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const colorRef = React.useRef("rgba(21,128,61,0.38)")

  React.useEffect(() => {
    colorRef.current =
      resolvedTheme === "dark" ? "rgba(74,227,143,0.4)" : "rgba(21,128,61,0.38)"
  }, [resolvedTheme])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext("2d")
    if (!canvas || !host || !ctx) return

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const ripples: Ripple[] = []
    let w = 1
    let h = 1
    let lines = 44
    let visible = true
    let frame = 0
    let lastMove = 0
    let lastAuto = 0
    let last = { x: -999, y: -999, t: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = host.clientWidth || 1
      h = host.clientHeight || 1
      lines = w < 640 ? 56 : 92
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }

    const draw = (now: number) => {
      const time = reduced ? 0 : now
      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = 0.8
      ctx.strokeStyle = colorRef.current
      const live = ripples.filter((r) => (now - r.t) / 1000 < 5)

      for (let i = 0; i < lines; i++) {
        const baseY = ((i + 0.5) / lines) * h
        const ny = baseY / h
        ctx.beginPath()
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          const nx = x / w
          let y =
            baseY +
            Math.sin(nx * 2.4 + ny * 6.5 + time * 0.00022) * 40 +
            Math.sin(nx * 4.6 - ny * 9.5 - time * 0.00016) * 18
          for (const r of live) {
            const age = (now - r.t) / 1000
            const dist = Math.hypot(x - r.x, baseY - r.y)
            const rel = dist - age * 320
            y +=
              (Math.exp(-(rel * rel) / 8100) *
                Math.exp(-age / 1.6) *
                Math.cos(rel * 0.06) *
                38) /
              (1 + dist * 0.0015)
          }
          if (x === -STEP) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }

    const addRipple = (x: number, y: number, now: number) => {
      if (ripples.length >= MAX_RIPPLES) ripples.shift()
      ripples.push({ x, y, t: now })
    }

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const now = performance.now()
      if (Math.hypot(x - last.x, y - last.y) < 28 || now - last.t < 70) return
      last = { x, y, t: now }
      lastMove = now
      addRipple(x, y, now)
    }

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      if (now - lastMove > 3000 && now - lastAuto > 1800) {
        lastAuto = now
        addRipple(
          w * (0.25 + Math.random() * 0.5),
          h * (0.25 + Math.random() * 0.5),
          now
        )
      }
      draw(now)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    const resizer = new ResizeObserver(resize)
    observer.observe(host)
    resizer.observe(host)
    resize()

    if (!reduced) {
      host.addEventListener("pointermove", onMove)
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      host.removeEventListener("pointermove", onMove)
      observer.disconnect()
      resizer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  )
}
