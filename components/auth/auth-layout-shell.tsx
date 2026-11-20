import type { ReactNode } from "react"
import Link from "next/link"

import { Logo } from "@/components/logo"
import { ThemeToggleButton } from "@/components/theme-toggle"

type AuthLayoutShellProps = {
  children: ReactNode
  brand?: string
}

/** Grid cell size. The card is exactly 2 x 2 cells so its edges sit on grid lines. */
const CELL_W = 240
const CELL_H = 256

const gridLine = "color-mix(in oklab, var(--foreground) 6%, transparent)"

const gridStyle: React.CSSProperties = {
  backgroundSize: `${CELL_W}px ${CELL_H}px`,
  backgroundPosition: "center",
  backgroundImage: [
    `linear-gradient(to right, transparent calc(50% - 0.5px), ${gridLine} calc(50% - 0.5px), ${gridLine} calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
    `linear-gradient(to bottom, transparent calc(50% - 0.5px), ${gridLine} calc(50% - 0.5px), ${gridLine} calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
  ].join(","),
}

export function AuthLayoutShell({
  children,
  brand = "Veridom",
}: AuthLayoutShellProps) {
  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div aria-hidden className="absolute inset-0 -z-10" style={gridStyle} />

      <ThemeToggleButton className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6" />

      <main
        className="relative flex w-full flex-col justify-center overflow-hidden rounded-2xl border bg-card px-6 py-12 shadow-xl sm:px-[60px]"
        style={{ maxWidth: CELL_W * 2, minHeight: CELL_H * 2 }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_100%)]"
        />
        <div className="relative flex flex-col gap-6">
          <Link
            href="/"
            className="mx-auto mb-2 inline-flex items-center gap-2.5 rounded-md text-2xl font-semibold tracking-tight text-foreground outline-none focus-visible:ring-3 focus-visible:ring-foreground/25"
          >
            <Logo className="size-9" title={brand} />
            <span>{brand}</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  )
}
