import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"

export type NotificationType =
  | "message"
  | "viewing"
  | "payment"
  | "refund"
  | "handover"
  | "payout"
  | "listing"
  | "general"

export type AppNotification = {
  /** A numeric string. */
  id: string
  type: NotificationType
  title: string
  body?: string | null
  /** A path inside this app, e.g. /account/deals/<id>. */
  link?: string | null
  readAt?: string | null
  createdAt: string
}

export type NotificationPage = {
  items: AppNotification[]
  nextBefore: string | null
}

export type NotificationPreference = {
  type: NotificationType
  label: string
  /** Money and security types: the email can't be switched off. */
  essential: boolean
  inApp: boolean
  email: boolean
}

const get = async <T>(path: string) =>
  (await apiRequest<ApiSuccess<T>>(path)).data
const send = async <T>(method: string, path: string, body: unknown) =>
  (
    await apiRequest<ApiSuccess<T>>(path, {
      method,
      body: JSON.stringify(body),
    })
  ).data

export const notificationsApi = {
  list: (
    opts: { limit?: number; before?: string; unreadOnly?: boolean } = {}
  ) =>
    get<NotificationPage>(
      `/api/v1/notifications?limit=${opts.limit ?? 20}${
        opts.before ? `&before=${opts.before}` : ""
      }${opts.unreadOnly ? "&unreadOnly=true" : ""}`
    ),
  unreadCount: async () =>
    (await get<{ unread: number }>("/api/v1/notifications/unread-count"))
      .unread,
  markRead: (target: { ids: string[] } | { all: true }) =>
    send<{ changed: number; unread: number }>(
      "POST",
      "/api/v1/notifications/read",
      target
    ),
  preferences: () =>
    get<NotificationPreference[]>("/api/v1/notifications/preferences"),
  setPreference: (
    type: NotificationType,
    body: { inApp?: boolean; email?: boolean }
  ) =>
    send<NotificationPreference[]>(
      "PUT",
      `/api/v1/notifications/preferences/${type}`,
      body
    ),
}
