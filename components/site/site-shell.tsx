import { Cta } from "./cta"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** Header + page + CTA + footer, shared by every inner page. */
export function SiteShell({
  children,
  cta = true,
}: {
  children: React.ReactNode
  /** Hide the closing banner on pages that already point to the same next step. */
  cta?: boolean
}) {
  return (
    <div className="relative overflow-x-clip bg-background pb-24 lg:pb-0">
      <SiteHeader />
      <main>{children}</main>
      {cta ? <Cta /> : null}
      <SiteFooter />
    </div>
  )
}
