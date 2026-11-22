"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

type Cell = {
  col: number
  row: number
  char: string
  until: number
  hot: boolean
}

const RAMP = "........:::=+xX#0369"
const CELL = 16
const LIFE = 320

const palette = {
  light: { glyph: "#5fae82", lit: "#007f3d", litGlyph: "#f4faf5" },
  dark: { glyph: "#2c8556", lit: "#20c45f", litGlyph: "#030f05" },
}

/** An image redrawn as ASCII on a canvas; glyphs light up in small clusters near the cursor. */
export function AsciiHand({
  src,
  columns = 64,
  flip,
  className,
}: {
  src: string
  columns?: number
  flip?: boolean
  className?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const colors = resolvedTheme === "dark" ? palette.dark : palette.light
  React.useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let cells = new Map<string, Cell>()
    let rows = 1
    let frame = 0
    let alive = true
    let visible = true
    let width = 0
    let height = 0

    const draw = () => {
      frame = 0
      const now = performance.now()
      const c = colors
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${CELL - 2}px "Geist Mono", ui-monospace, monospace`
      ctx.textBaseline = "top"
      let active = false
      const pulse = 0.55 + 0.45 * Math.sin(now / 520)
      cells.forEach((cell) => {
        const lit = cell.until > now
        if (cell.hot) {
          active = true
          ctx.globalAlpha = reduced ? 1 : 0.45 + 0.55 * pulse
          ctx.fillStyle = c.lit
          ctx.fillRect(cell.col * CELL, cell.row * CELL, CELL, CELL)
          ctx.globalAlpha = 1
          ctx.fillStyle = c.litGlyph
        } else if (lit) {
          active = true
          ctx.fillStyle = c.lit
          ctx.fillRect(cell.col * CELL, cell.row * CELL, CELL, CELL)
          ctx.fillStyle = c.litGlyph
        } else {
          ctx.fillStyle = c.glyph
        }
        ctx.fillText(cell.char, cell.col * CELL + 2, cell.row * CELL + 1)
      })
      if (active && visible && !reduced) frame = requestAnimationFrame(draw)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const image = new Image()
    image.onload = () => {
      if (!alive) return
      rows = Math.max(
        1,
        Math.round(columns / (image.naturalWidth / image.naturalHeight))
      )
      const sampler = document.createElement("canvas")
      sampler.width = columns
      sampler.height = rows
      const sctx = sampler.getContext("2d")
      if (!sctx) return
      // Transparent pixels become white, which reads as empty space.
      sctx.fillStyle = "#fff"
      sctx.fillRect(0, 0, columns, rows)
      if (flip) {
        sctx.translate(columns, 0)
        sctx.scale(-1, 1)
      }
      sctx.drawImage(image, 0, 0, columns, rows)
      const px = sctx.getImageData(0, 0, columns, rows).data
      const empty = RAMP.lastIndexOf(".")
      cells = new Map()
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const o = (row * columns + col) * 4
          const b =
            (px[o] * 0.299 + px[o + 1] * 0.587 + px[o + 2] * 0.114) / 255
          const base = Math.min(
            RAMP.length - 1,
            Math.floor(Math.pow(1 - b, 0.55) * RAMP.length)
          )
          if (base <= empty) continue
          // Green marks the country to highlight; glyphs vary a little.
          const hot = px[o + 1] - px[o] > 60
          const noise = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453
          const jitter = Math.floor((noise - Math.floor(noise)) * 3)
          const i = Math.max(empty + 1, base - jitter)
          cells.set(`${col},${row}`, { col, row, char: RAMP[i], until: 0, hot })
        }
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = columns * CELL
      height = rows * CELL
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }
    image.src = src

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
    })
    observer.observe(canvas)

    const onMove = (e: PointerEvent) => {
      if (reduced) return
      const rect = canvas.getBoundingClientRect()
      const col = Math.floor(((e.clientX - rect.left) / rect.width) * columns)
      const row = Math.floor(((e.clientY - rect.top) / rect.height) * rows)
      const start = cells.get(`${col},${row}`)
      if (!start) return
      const now = performance.now()
      start.until = now + LIFE
      let current = start
      const steps = 1 + Math.floor(Math.random() * 9)
      for (let s = 0; s < steps; s++) {
        const near: Cell[] = []
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const n = cells.get(`${current.col + dx},${current.row + dy}`)
            if (n && n !== current) near.push(n)
          }
        if (!near.length) break
        current = near[Math.floor(Math.random() * near.length)]
        current.until = now + LIFE + s * 12
      }
      schedule()
    }
    window.addEventListener("pointermove", onMove)

    return () => {
      alive = false
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
    }
  }, [src, columns, flip, colors])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block h-auto w-full", className)}
    />
  )
}
