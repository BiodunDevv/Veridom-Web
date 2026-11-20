import { Button } from "@/components/ui/button"

import { IconMask } from "./icon-mask"

/** "01 of N" counter with prev / next controls, as in the design. */
export function SectionPager({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between border-t pt-3">
      <p className="text-sm font-medium text-muted-foreground">
        <span className="text-foreground">01</span> of {total}
      </p>
      <div className="flex gap-2.5">
        <Button variant="outline" size="icon-sm" className="rounded-full" disabled aria-label="Previous">
          <IconMask src="/landing/icon-prev.svg" className="size-4" />
        </Button>
        <Button variant="secondary" size="icon-sm" className="rounded-full" aria-label="Next">
          <IconMask src="/landing/icon-next.svg" className="size-4" />
        </Button>
      </div>
    </div>
  )
}
