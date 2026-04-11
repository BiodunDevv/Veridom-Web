import { Suspense } from "react"

import { VerifyEmailPanel } from "@/components/auth/verify-email-panel"

function VerifyEmailFallback() {
  return <div className="min-h-40" />
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailPanel />
    </Suspense>
  )
}
