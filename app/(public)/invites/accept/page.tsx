import { Suspense } from "react"

import { AcceptInvite } from "@/components/lister/accept-invite"
import { SiteShell } from "@/components/site/site-shell"

export default function AcceptInvitePage() {
  return (
    <SiteShell>
      <Suspense>
        <AcceptInvite />
      </Suspense>
    </SiteShell>
  )
}
