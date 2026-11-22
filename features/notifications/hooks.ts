"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/api/client"
import {
  notificationsApi,
  type NotificationType,
} from "@/lib/api/notifications"

export const notificationKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  list: (unreadOnly: boolean) => ["notifications", "list", unreadOnly] as const,
  prefs: ["notifications", "prefs"] as const,
}

/** The bell badge. Refreshes every 30 seconds and when the tab regains focus. */
export const useUnreadCount = (enabled: boolean) =>
  useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationsApi.unreadCount,
    enabled,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
  })

export const useNotifications = (enabled: boolean, unreadOnly = false) =>
  useInfiniteQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: ({ pageParam }) =>
      notificationsApi.list({
        before: pageParam || undefined,
        unreadOnly,
        limit: 20,
      }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextBefore ?? undefined,
    enabled,
    refetchOnWindowFocus: true,
  })

export const useMarkRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: ({ unread }) => {
      queryClient.setQueryData(notificationKeys.unread, unread)
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "list"],
      })
    },
  })
}

export const usePreferences = () =>
  useQuery({
    queryKey: notificationKeys.prefs,
    queryFn: notificationsApi.preferences,
    staleTime: 60_000,
  })

export const useSetPreference = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      ...body
    }: {
      type: NotificationType
      inApp?: boolean
      email?: boolean
    }) => notificationsApi.setPreference(type, body),
    onSuccess: (list) => queryClient.setQueryData(notificationKeys.prefs, list),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Couldn't save that setting.")),
  })
}
