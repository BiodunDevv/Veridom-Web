"use client"

import * as React from "react"
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage, isApiError } from "@/lib/api/client"

type QueryProviderProps = {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          // One toast per failing query. Guests (401) and missing items (404) are normal states.
          onError: (error, query) => {
            if (query.meta?.silent) return
            if (
              isApiError(error) &&
              (error.status === 401 || error.status === 404)
            )
              return
            toast.error(getApiErrorMessage(error, "Could not load this."), {
              id: query.queryHash,
            })
          },
        }),
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
