"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Deterministic pseudo-random, so server and client draw the same skyline. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const buildings = (() => {
  const list: { x: number; w: number; h: number }[] = []
  let x = -10
  let i = 0
  while (x < 1210) {
    const w = 34 + Math.floor(rand(i + 1) * 62)
    const h = 40 + Math.floor(rand(i + 7) * 150)
    list.push({ x, w, h })
    x += w + 4 + Math.floor(rand(i + 3) * 8)
    i++
  }
  return list
})()

/** A city skyline whose windows twinkle. Sits along the bottom of its parent. */
export function SkylineBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMax slice"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-[70%] w-full text-primary",
        className
      )}
    >
      {buildings.map((b, i) => {
        const top = 220 - b.h
        const cols = Math.max(2, Math.floor(b.w / 14))
        const rows = Math.floor(b.h / 18)
        return (
          <g key={i}>
            <rect
              x={b.x}
              y={top}
              width={b.w}
              height={b.h}
              fill="currentColor"
              opacity={0.1 + (i % 3) * 0.04}
            />
            {Array.from({ length: rows * cols }).map((_, k) => {
              const r = Math.floor(k / cols)
              const c = k % cols
              if (rand(i * 97 + k) < 0.55) return null
              return (
                <rect
                  key={k}
                  x={b.x + 6 + c * 12}
                  y={top + 8 + r * 16}
                  width={5}
                  height={7}
                  rx={1}
                  fill="currentColor"
                  className="animate-twinkle motion-reduce:animate-none"
                  style={{
                    animationDelay: `${Math.floor(rand(i * 31 + k) * 40) / 10}s`,
                    animationDuration: `${3 + Math.floor(rand(k + i) * 40) / 10}s`,
                  }}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/** Dot grid that lights up around the cursor. Listens on its parent. */
export function SpotlightGrid({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      el.style.setProperty("--mx", `${e.clientX - r.left}px`)
      el.style.setProperty("--my", `${e.clientY - r.top}px`)
      el.style.setProperty("--on", "1")
    }
    const leave = () => el.style.setProperty("--on", "0")
    host.addEventListener("pointermove", move)
    host.addEventListener("pointerleave", leave)
    return () => {
      host.removeEventListener("pointermove", move)
      host.removeEventListener("pointerleave", leave)
    }
  }, [])

  const dots = (alpha: string) =>
    `radial-gradient(circle, color-mix(in oklab, var(--primary) ${alpha}, transparent) 1.4px, transparent 1.6px)`

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={
        { "--mx": "70%", "--my": "40%", "--on": "0" } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: dots("22%"), backgroundSize: "24px 24px" }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: dots("90%"),
          backgroundSize: "24px 24px",
          opacity: "calc(0.35 + var(--on) * 0.65)",
          maskImage:
            "radial-gradient(220px circle at var(--mx) var(--my), black, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(220px circle at var(--mx) var(--my), black, transparent 70%)",
        }}
      />
    </div>
  )
}

/** Architect's blueprint: faint grid with dimension lines and arcs that draw in. */
export function BlueprintBackdrop({ className }: { className?: string }) {
  const draw = {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
  } as React.CSSProperties
  const line =
    "animate-draw fill-none stroke-primary/40 motion-reduce:animate-none"

  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMaxYMid slice"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
    >
      <defs>
        <pattern
          id="bp-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0H0V40"
            fill="none"
            className="stroke-primary/15"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="bp-fade" cx="75%" cy="45%" r="70%">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </radialGradient>
        <mask id="bp-mask">
          <rect width="1200" height="420" fill="url(#bp-fade)" />
        </mask>
      </defs>
      <g mask="url(#bp-mask)">
        <rect width="1200" height="420" fill="url(#bp-grid)" />
      </g>
      {/* A floor plan sketch: room outline, door arc, dimension line. */}
      <g strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path className={line} style={draw} d="M760 90H1080V330H760Z" />
        <path
          className={line}
          style={{ ...draw, animationDelay: "0.4s" }}
          d="M900 90V210H1080"
        />
        <path
          className={line}
          style={{ ...draw, animationDelay: "0.8s" }}
          d="M760 250H860A60 60 0 0 1 920 310V330"
        />
        <path
          className={line}
          style={{ ...draw, animationDelay: "1.1s" }}
          d="M760 60H1080M760 52V68M1080 52V68"
        />
        <path
          className={line}
          style={{ ...draw, animationDelay: "1.4s" }}
          d="M1110 90V330M1102 90H1118M1102 330H1118"
        />
        <circle
          className={line}
          style={{ ...draw, animationDelay: "0.2s" }}
          cx="930"
          cy="210"
          r="150"
        />
      </g>
    </svg>
  )
}

/** Soft, slowly drifting colour. A calm alternative to line art. */
export function MeshBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute -top-1/3 -right-[10%] size-[60%] animate-drift rounded-full bg-primary/25 blur-3xl motion-reduce:animate-none" />
      <div
        className="absolute -bottom-1/2 left-[10%] size-[55%] animate-drift rounded-full bg-chart-2/25 blur-3xl motion-reduce:animate-none"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="absolute top-[10%] left-[45%] size-[35%] animate-drift rounded-full bg-chart-4/20 blur-3xl motion-reduce:animate-none"
        style={{ animationDelay: "-9s" }}
      />
    </div>
  )
}
