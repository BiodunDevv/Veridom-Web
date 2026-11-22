import Link from "next/link"

import { cn } from "@/lib/utils"

import { IconMask } from "./icon-mask"

/** The circular "Discover Your Dream Property" badge from the design, text on a path. */
export function HeroBadge({ className }: { className?: string }) {
  return (
    <Link
      href="#properties"
      aria-label="Discover your dream property"
      className={cn(
        "group relative grid place-items-center rounded-full border bg-card shadow-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <svg
        viewBox="0 0 175 175"
        aria-hidden
        className="animate-spin-slow absolute inset-0 size-full fill-foreground"
      >
        <defs>
          <path
            id="badge-circle"
            d="M87.5 87.5m-62 0a62 62 0 1 1 124 0a62 62 0 1 1-124 0"
          />
        </defs>
        <text fontSize="15" fontWeight="600" letterSpacing="2.4">
          <textPath href="#badge-circle" textLength="386">
            Discover Your Dream Property ✨
          </textPath>
        </text>
      </svg>
      <span className="grid size-14 place-items-center rounded-full border bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <IconMask src="/landing/arrow-circle.svg" className="size-6" />
      </span>
    </Link>
  )
}
