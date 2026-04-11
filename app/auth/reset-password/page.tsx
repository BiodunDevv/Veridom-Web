import { Suspense } from "react"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

function ResetPasswordFallback() {
  return <div className="min-h-40" />
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
