import type { ReactNode } from "react"
import Link from "next/link"

import { AuthShowcase } from "@/components/auth/auth-showcase"
import { Logo } from "@/components/logo"

type AuthLayoutShellProps = {
  children: ReactNode
  title: string
  description: string
}

export function AuthLayoutShell({
  children,
  title,
  description,
}: AuthLayoutShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="inline-flex items-center gap-2 font-medium">
            <Logo className="size-12" title="Veridom" />
            <span>Veridom</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <AuthShowcase title={title} description={description} />
      </div>
    </div>
  )
}
