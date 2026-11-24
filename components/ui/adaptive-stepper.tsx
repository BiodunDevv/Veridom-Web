"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A numeric stepper with a fixed footprint. At the minimum or maximum the
 * unavailable button folds away and the value takes its space; between steps
 * the number rolls up or down.
 */
export function AdaptiveStepper({
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  disabled,
  format = (n) => String(n),
  label,
  className,
}: {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** How the number is shown and announced, e.g. "+30 min". */
  format?: (value: number) => string
  label: string
  className?: string
}) {
  const previous = React.useRef(value)
  const direction = value >= previous.current ? "up" : "down"
  React.useEffect(() => {
    previous.current = value
  }, [value])

  const atMin = value <= min
  const atMax = value >= max
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  const button = (kind: "dec" | "inc") => {
    const hidden = kind === "dec" ? atMin : atMax
    const Icon = kind === "dec" ? Minus : Plus
    return (
      <button
        type="button"
        disabled={disabled || hidden}
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden}
        aria-label={`${kind === "dec" ? "Decrease" : "Increase"} ${label}`}
        onClick={() =>
          onValueChange(clamp(value + (kind === "dec" ? -step : step)))
        }
        className={cn(
          "grid h-full shrink-0 place-items-center overflow-hidden rounded-full bg-background text-foreground shadow-sm ring-1 ring-border transition-[width,opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-90 disabled:pointer-events-none",
          hidden ? "w-0 scale-50 opacity-0 ring-0" : "w-11 opacity-100"
        )}
      >
        <Icon className="size-4" />
      </button>
    )
  }

  return (
    <fieldset
      disabled={disabled}
      className={cn(
        "flex h-12 min-w-0 items-stretch gap-1.5 rounded-full bg-muted p-1 transition-[gap] duration-300",
        (atMin || atMax) && "gap-0",
        disabled && "opacity-60",
        className
      )}
    >
      <legend className="sr-only">{`${label}: ${format(value)}`}</legend>
      {button("dec")}
      <output
        aria-live="polite"
        className="relative grid min-w-24 flex-1 place-items-center overflow-hidden text-base font-semibold tabular-nums"
      >
        <span
          key={value}
          className={cn(
            "animate-in fade-in motion-reduce:animate-none",
            direction === "up"
              ? "slide-in-from-bottom-3"
              : "slide-in-from-top-3"
          )}
        >
          {format(value)}
        </span>
      </output>
      {button("inc")}
    </fieldset>
  )
}
