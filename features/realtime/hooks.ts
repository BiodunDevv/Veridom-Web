"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { useMe } from "@/features/auth/hooks"
import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"

/** Fired when the socket says a thread changed; the open thread polls at once. */
export const INQUIRY_HINT = "veridom:inquiry-updated"

const apiOrigin = () => {
  const value = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

/**
 * Optional speed-up. The socket only says "something changed": the data
 * still comes over REST, and the normal polling keeps running if it drops.
 * Each (re)connect asks for a brand-new one-time ticket.
 */
export function useRealtime(enabled: boolean) {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const origin = apiOrigin()
    if (!enabled || !origin) return
    let stopped = false
    let socket: import("socket.io-client").Socket | null = null
    let retry: number | undefined
    let delay = 5_000

    const connect = async () => {
      try {
        const { data } = await apiRequest<
          ApiSuccess<{ ticket: string; expiresInSeconds: number }>
        >("/api/v1/realtime/ticket", {
          method: "POST",
          body: JSON.stringify({}),
        })
        if (stopped) return
        const { io } = await import("socket.io-client")
        socket = io(origin, {
          path: "/socket",
          transports: ["websocket"],
          auth: { ticket: data.ticket },
          reconnection: false,
        })
        socket.on("connect", () => {
          delay = 5_000
        })
        socket.on("inquiry.updated", (event: { inquiryId?: string }) => {
          void queryClient.invalidateQueries({ queryKey: ["chat"] })
          window.dispatchEvent(
            new CustomEvent(INQUIRY_HINT, { detail: event?.inquiryId })
          )
        })
        socket.on("notification.created", () => {
          void queryClient.invalidateQueries({ queryKey: ["notifications"] })
        })
        const again = () => {
          socket?.close()
          socket = null
          if (stopped) return
          // Back off, and use a fresh ticket: the old one worked only once.
          retry = window.setTimeout(connect, delay)
          delay = Math.min(delay * 2, 60_000)
        }
        socket.on("connect_error", again)
        socket.on("disconnect", again)
      } catch {
        if (stopped) return
        retry = window.setTimeout(connect, delay)
        delay = Math.min(delay * 2, 60_000)
      }
    }

    void connect()
    return () => {
      stopped = true
      window.clearTimeout(retry)
      socket?.close()
    }
  }, [enabled, queryClient])
}

/** Mounted once for signed-in people. */
export function RealtimeBridge() {
  const me = useMe().data
  useRealtime(Boolean(me))
  return null
}
