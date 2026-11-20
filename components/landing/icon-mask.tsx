import { cn } from "@/lib/utils"

/** Paints a downloaded SVG asset in `currentColor`, so it follows the theme. */
export function IconMask({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn("block size-[34px] shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
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
