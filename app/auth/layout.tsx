import type { ReactNode } from "react"

import { AuthLayoutShell } from "@/components/auth/auth-layout-shell"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthLayoutShell
      title="Veridom"
      description="Move from sign up to verification and secure access with a cleaner property journey built for tenants and landlords."
    >
      {children}
    </AuthLayoutShell>
  )
}
