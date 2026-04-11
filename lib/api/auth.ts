import { apiRequest } from "@/lib/api/client"
import type {
  ApiMessage,
  ApiSuccess,
  AuthUser,
  SessionItem,
  UserRole,
} from "@/lib/api/types"

export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role: Exclude<UserRole, "SUPERADMIN">
}

export type LoginPayload = {
  email: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  token: string
  password: string
}

export type VerifyEmailPayload = {
  token: string
}

export type ResendVerificationPayload = {
  email: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const response = await apiRequest<ApiSuccess<AuthUser>>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    return response.data
  },
  login: async (payload: LoginPayload) => {
    const response = await apiRequest<ApiSuccess<AuthUser>>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    return response.data
  },
  logout: async () => {
    return apiRequest<ApiMessage>("/api/v1/auth/logout", {
      method: "POST",
    })
  },
  logoutAll: async () => {
    return apiRequest<ApiMessage>("/api/v1/auth/logout-all", {
      method: "POST",
    })
  },
  me: async () => {
    const response = await apiRequest<ApiSuccess<AuthUser>>("/api/v1/auth/me")

    return response.data
  },
  forgotPassword: async (payload: ForgotPasswordPayload) => {
    return apiRequest<ApiMessage>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  resetPassword: async (payload: ResetPasswordPayload) => {
    return apiRequest<ApiMessage>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  verifyEmail: async (payload: VerifyEmailPayload) => {
    return apiRequest<ApiMessage>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  resendVerification: async (payload: ResendVerificationPayload) => {
    return apiRequest<ApiMessage>("/api/v1/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    return apiRequest<ApiMessage>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  listSessions: async () => {
    const response = await apiRequest<ApiSuccess<SessionItem[]>>("/api/v1/auth/sessions")

    return response.data
  },
  revokeSession: async (sessionTrackerId: string) => {
    return apiRequest<ApiMessage>(`/api/v1/auth/sessions/${sessionTrackerId}`, {
      method: "DELETE",
    })
  },
}
