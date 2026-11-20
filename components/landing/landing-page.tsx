import { Cta } from "@/components/site/cta"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Faq } from "./faq"
import { Hero } from "./hero"
import { Properties } from "./properties"
import { Testimonials } from "./testimonials"

export function LandingPage() {
  return (
    <div className="relative overflow-x-clip bg-background">
      {/* First screen: header and hero fit exactly one viewport on desktop. */}
      <div className="flex min-h-svh flex-col lg:h-svh lg:overflow-hidden">
        <SiteHeader />
        <main className="flex min-h-0 flex-1 flex-col">
          <Hero />
        </main>
      </div>
      <Properties />
      <Testimonials />
      <Faq />
      <Cta />
      <SiteFooter />
    </div>
  )
}
