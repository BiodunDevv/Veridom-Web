import { Cta } from "@/components/site/cta"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Faq } from "./faq"
import { Hero } from "./hero"
import { Properties } from "./properties"
import { About } from "./about"

export function LandingPage() {
  return (
    <div className="relative overflow-x-clip bg-background">
      <SiteHeader />
      {/* First screen: hero fills the viewport below the sticky header. */}
      <div className="flex min-h-[calc(100svh-5.75rem)] flex-col lg:h-[calc(100svh-6.25rem)] lg:overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col">
          <Hero />
        </main>
      </div>
      <Properties />
      <About />
      <Faq />
      <Cta />
      <SiteFooter />
    </div>
  )
}
