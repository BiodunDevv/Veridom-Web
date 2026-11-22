import Image from "next/image"

import { cn } from "@/lib/utils"

/** The Figma contour-line pattern, used as a quiet texture. */
export function PatternBg({ className }: { className?: string }) {
  return (
    <Image
      src="/landing/abstract-lines.svg"
      alt=""
      aria-hidden
      fill
      unoptimized
      className={cn(
        "pointer-events-none object-cover opacity-30 dark:opacity-60",
        className
      )}
    />
  )
}
