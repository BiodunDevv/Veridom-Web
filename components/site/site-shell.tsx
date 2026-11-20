import { Cta } from "./cta"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** Header + page + CTA + footer, shared by every inner page. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-x-clip bg-background">
      <SiteHeader />
      <main>{children}</main>
      <Cta />
      <SiteFooter />
    </div>
  )
}
