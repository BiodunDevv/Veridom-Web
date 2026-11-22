"use client"

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage, isApiError } from "@/lib/api/client"
import { takeApiMessage } from "@/lib/api/last-message"

/** Adds the API's "missing" list (for example when submitting an incomplete listing). */
function describe(error: unknown, fallback: string) {
  const base = getApiErrorMessage(error, fallback)
  const details = isApiError(error)
    ? (error.details as
        | { missing?: string[]; stillProcessing?: number }
        | undefined)
    : undefined
  const extra = [
    details?.missing?.length ? `Missing: ${details.missing.join(", ")}.` : "",
    details?.stillProcessing
      ? `${details.stillProcessing} upload(s) still processing.`
      : "",
  ]
    .filter(Boolean)
    .join(" ")
  return extra ? `${base} ${extra}` : base
}

/** A mutation that refreshes the given queries and toasts the outcome. */
export function useAction<TVars = void, TData = unknown>(
  fn: (vars: TVars) => Promise<TData>,
  options: {
    success?: string
    invalidate?: QueryKey[]
    onSuccess?: (data: TData) => void
    fallbackError?: string
  } = {}
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: async (data) => {
      await Promise.all(
        (options.invalidate ?? []).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      )
      if (options.success) {
        toast.success(options.success, {
          description: takeApiMessage(options.success),
        })
      }
      options.onSuccess?.(data)
    },
    onError: (error) =>
      toast.error(
        describe(
          error,
          options.fallbackError ?? "That didn't work. Please try again."
        )
      ),
  })
}
