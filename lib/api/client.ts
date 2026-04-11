import type { ApiErrorPayload } from "@/lib/api/types"

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()

  if (!value) {
    return null
  }

  const normalizedValue = value.replace(/\/$/, "")

  if (typeof window === "undefined") {
    return normalizedValue
  }

  try {
    const backendOrigin = new URL(normalizedValue).origin

    if (backendOrigin !== window.location.origin) {
      return "/backend"
    }
  } catch {
    return normalizedValue
  }

  return normalizedValue
}

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(message: string, status: number, code: string, details?: unknown) {
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

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong.",
) => {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    throw new ApiError(
      "NEXT_PUBLIC_BACKEND_URL is not configured.",
      500,
      "CONFIG_MISSING",
    )
  }

  const headers = new Headers(init.headers)

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
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
        errorPayload.error.details,
      )
    }

    throw new ApiError(
      response.statusText || "Request failed",
      response.status,
      "REQUEST_FAILED",
    )
  }

  return payload as T
}
