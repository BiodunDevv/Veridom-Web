"use client"

import type { ReactNode } from "react"

import { CookieNotice } from "@/components/site/cookie-notice"
import { TrackingParams } from "@/components/site/tracking-params"
import { Toaster } from "@/components/ui/sonner"
import { AuthModalProvider } from "@/components/auth/auth-modal"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReduxProvider } from "@/providers/redux-provider"
import { QueryProvider } from "@/providers/query-provider"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <TooltipProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </TooltipProvider>
        <Toaster />
        <CookieNotice />
        <TrackingParams />
      </QueryProvider>
    </ReduxProvider>
  )
}
