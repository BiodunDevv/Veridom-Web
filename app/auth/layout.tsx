import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AuthLayoutShell } from "@/components/auth/auth-layout-shell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>
}
