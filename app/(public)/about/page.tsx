import type { Metadata } from "next"

import { pageMetadata } from "@/lib/site"
import { Achievements } from "@/components/about/achievements"
import { Clients } from "@/components/about/clients"
import { Journey } from "@/components/about/journey"
import { Process } from "@/components/about/process"
import { Team } from "@/components/about/team"
import { Values } from "@/components/about/values"
import { Reveal } from "@/components/ui/reveal"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = pageMetadata({
  title: "About Us | Veridom",
  description:
    "Learn how Veridom is making property search and deals in Nigeria verified, transparent and secure.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <SiteShell>
      <Journey />
      <Reveal>
        <Values />
      </Reveal>
      <Reveal>
        <Achievements />
      </Reveal>
      <Reveal>
        <Process />
      </Reveal>
      <Reveal>
        <Team />
      </Reveal>
      <Reveal>
        <Clients />
      </Reveal>
    </SiteShell>
  )
}
