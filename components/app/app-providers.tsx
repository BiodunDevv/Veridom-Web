"use client"

import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { ReduxProvider } from "@/providers/redux-provider"
import { QueryProvider } from "@/providers/query-provider"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider>
      <QueryProvider>
        {children}
        <Toaster richColors />
      </QueryProvider>
    </ReduxProvider>
  )
}
