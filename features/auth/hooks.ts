"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { clearAuthState } from "@/features/auth/auth-slice"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { queryKeys } from "@/lib/query/keys"
import { useAppDispatch } from "@/lib/store/store"

export const useMe = () =>
  useQuery({ queryKey: queryKeys.me, queryFn: authApi.me })

export const useSessions = () =>
  useQuery({ queryKey: queryKeys.sessions, queryFn: authApi.listSessions })

/** Clears local state, refreshes `me` and returns to the login page. */
function useSignOutFlow(message?: string) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return async () => {
    dispatch(clearAuthState())
    await queryClient.invalidateQueries({ queryKey: queryKeys.me })
    if (message) toast.success(message)
    router.push("/?auth=login")
  }
}

export function useLogout(message = "You have been signed out.") {
  const done = useSignOutFlow(message)
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: done,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not sign you out.")),
  })
}

export function useLogoutAll() {
  const done = useSignOutFlow("All sessions were revoked.")
  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: done,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not revoke sessions.")),
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success("Session revoked.")
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not revoke the session.")),
  })
}

export function useChangePassword(options: {
  onSuccess?: () => void
  onError?: (message: string) => void
}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      options.onSuccess?.()
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      toast.success("Password changed successfully.")
    },
    onError: (error) =>
      options.onError?.(
        getApiErrorMessage(error, "Could not change your password.")
      ),
  })
}
