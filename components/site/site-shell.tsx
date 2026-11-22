import { cn } from "@/lib/utils"

import { Cta } from "./cta"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** Header + page + CTA + footer, shared by every inner page. */
export function SiteShell({
  children,
  cta = true,
  footer = true,
}: {
  children: React.ReactNode
  /** Hide the closing banner on pages that already point to the same next step. */
  cta?: boolean
  /** App-like pages (search, listing, account) skip the big footer. */
  footer?: boolean
}) {
  return (
    <div
      className={cn(
        "relative overflow-x-clip bg-background",
        footer ? "pb-0" : "pb-28 lg:pb-12"
      )}
    >
      <SiteHeader />
      <main>{children}</main>
      {cta ? <Cta /> : null}
      {footer ? <SiteFooter /> : null}
    </div>
  )
}
