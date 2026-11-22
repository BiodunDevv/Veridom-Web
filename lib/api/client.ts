import { rememberApiMessage } from "@/lib/api/last-message"
import type { ApiErrorPayload } from "@/lib/api/types"

/** Cross-origin backends go through the /backend rewrite so cookies stay first-party. */
const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()

  if (!value) {
    return null
  }

  const backendUrl = value.replace(/\/$/, "")

  if (typeof window === "undefined") {
    return backendUrl
  }

  try {
    return new URL(backendUrl).origin === window.location.origin
      ? backendUrl
      : "/backend"
  } catch {
    return backendUrl
  }
}

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(
    message: string,
    status: number,
    code: string,
    details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

const parseResponseBody = async (response: Response) => {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError

/** Clearer wording for limits people hit while uploading. */
const FRIENDLY: Record<string, string> = {
  MEDIA_LIMIT:
    "You've reached the limit: 30 photos, 5 documents, or 5 photos per viewing.",
  MEDIA_MINIMUM:
    "A listing that's been submitted needs at least 3 photos. Add another before removing this one.",
  FILE_TOO_LARGE: "That file is too large. Photos can be up to 10 MB.",
  UPLOAD_MISSING: "The upload didn't finish. Please try that file again.",
  UPLOAD_SIZE_MISMATCH: "The upload didn't match the file. Please try again.",
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong."
) => {
  if (isApiError(error)) {
    return FRIENDLY[error.code] ?? error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    throw new ApiError(
      "NEXT_PUBLIC_BACKEND_URL is not configured.",
      500,
      "CONFIG_MISSING"
    )
  }

  const headers = new Headers(init.headers)

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  // The API rejects state-changing requests without this header (CSRF guard).
  const method = (init.method ?? "GET").toUpperCase()

  if (
    method !== "GET" &&
    method !== "HEAD" &&
    !headers.has("X-Veridom-Client")
  ) {
    headers.set("X-Veridom-Client", "web")
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  })

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    if (
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error &&
      typeof payload.error === "object"
    ) {
      const errorPayload = payload as ApiErrorPayload

      throw new ApiError(
        errorPayload.error.message,
        response.status,
        errorPayload.error.code,
        errorPayload.error.details
      )
    }

    throw new ApiError(
      response.statusText || "Request failed",
      response.status,
      "REQUEST_FAILED"
    )
  }

  if (
    method !== "GET" &&
    method !== "HEAD" &&
    payload &&
    typeof payload === "object"
  ) {
    rememberApiMessage((payload as { message?: unknown }).message)
  }

  return payload as T
}
