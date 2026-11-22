import type { Metadata } from "next"

import { NotFoundView } from "@/components/site/not-found-view"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Page not found | Veridom",
  description: "We couldn't find that page.",
}

export default function NotFound() {
  return (
    <SiteShell cta={false}>
      <NotFoundView />
    </SiteShell>
  )
}
