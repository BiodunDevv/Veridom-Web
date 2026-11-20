import type { Metadata } from "next"

import { Achievements } from "@/components/about/achievements"
import { Clients } from "@/components/about/clients"
import { Journey } from "@/components/about/journey"
import { Process } from "@/components/about/process"
import { Team } from "@/components/about/team"
import { Values } from "@/components/about/values"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "About Us | Veridom",
  description: "Our journey, values, team and the clients we serve.",
}

export default function AboutPage() {
  return (
    <SiteShell>
      <Journey />
      <Values />
      <Achievements />
      <Process />
      <Team />
      <Clients />
    </SiteShell>
  )
}
