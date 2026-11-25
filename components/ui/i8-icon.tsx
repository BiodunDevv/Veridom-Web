import { cn } from "@/lib/utils"

/** Icons8 "iOS" line icons, with the matching filled set for active states. */
export type I8Name =
  | "search"
  | "calendar"
  | "speech-bubble"
  | "handshake"
  | "ellipsis"
  | "multiply"
  | "grid-2"
  | "building"
  | "shield"
  | "conference-call"
  | "money-bag"
  | "activity-history"
  | "settings"
  | "user"
  | "back"

/**
 * Drawn as a CSS mask over `currentColor`, so the icon takes whatever text
 * colour it sits in: green on the active tab, muted when idle, white on the
 * primary button, and it follows light and dark mode with no extra files.
 */
export function I8Icon({
  name,
  filled,
  className,
}: {
  name: I8Name
  filled?: boolean
  className?: string
}) {
  const url = `url(/icons/i8/${filled ? "filled" : "line"}/${name}.png)`
  return (
    <span
      aria-hidden
      className={cn("inline-block size-5 shrink-0 bg-current", className)}
      style={{
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  )
}
