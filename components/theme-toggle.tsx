"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

/**
 * Switches the theme with a View Transitions reveal (see the `::view-transition`
 * rules in globals.css). Falls back to an instant switch where the API is missing
 * or the visitor prefers reduced motion. The icon animates from the `.dark` class
 * alone, so there is no state to hydrate and no flash on load.
 */
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return React.useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion || !document.startViewTransition) {
      setTheme(next)
      return
    }

    document.startViewTransition(() => setTheme(next))
  }, [resolvedTheme, setTheme])
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const toggleTheme = useThemeToggle()
  const clipId = React.useId()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-foreground p-2 text-background shadow-md outline-none transition-[scale,box-shadow] duration-200 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
        className
      )}
    >
      {/* Sun that a cut-out slides across to leave a crescent moon. */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="size-full"
      >
        <clipPath id={clipId}>
          <path
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
            className="translate-x-0 translate-y-0 transition-[translate] duration-[350ms] ease-in-out dark:translate-x-[-12px] dark:translate-y-[10px]"
          />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <circle
            cx="16"
            cy="16"
            className="[r:8px] transition-[r] duration-[350ms] ease-in-out dark:[r:10px]"
          />
          <g
            stroke="currentColor"
            strokeWidth="1.5"
            className="origin-center rotate-0 scale-100 opacity-100 transition-[rotate,scale,opacity] duration-[350ms] ease-in-out [transform-box:fill-box] dark:-rotate-[100deg] dark:scale-50 dark:opacity-0"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </g>
        </g>
      </svg>
    </button>
  )
}
