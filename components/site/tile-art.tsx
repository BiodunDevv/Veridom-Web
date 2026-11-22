import { IconMask } from "@/components/landing/icon-mask"
import { cn } from "@/lib/utils"

/** The tiled corner art from the closing banner. Place inside a `relative isolate` parent. */
export function TileArt({ className }: { className?: string }) {
  return (
    <>
      <IconMask
        src="/landing/cta-art-left.svg"
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 -z-10 h-[258px] w-[474px] text-foreground/[0.07] dark:text-foreground/[0.09]",
          className
        )}
      />
      <IconMask
        src="/landing/cta-art-right.svg"
        className={cn(
          "pointer-events-none absolute right-0 bottom-0 -z-10 h-[310px] w-[569px] -scale-y-100 rotate-180 text-foreground/[0.07] dark:text-foreground/[0.09]",
          className
        )}
      />
    </>
  )
}
