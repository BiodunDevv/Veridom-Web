export type ApiSuccess<T> = {
  success: true
  message?: string
  data: T
}

export type ApiMessage = {
  success: true
  message: string
}

export type ApiErrorPayload = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type UserRole = "TENANT" | "LANDLORD" | "SUPERADMIN"

export type UserStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "LOCKED"

export type AuthUser = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: UserRole
  status: UserStatus
  emailVerifiedAt?: string | null
  phoneVerifiedAt?: string | null
  failedLoginCount?: number
  lockedUntil?: string | null
  lastPasswordChangedAt?: string | null
  mfaEnabled?: boolean
  mfaType?: string | null
  profileImage?: string | null
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export type SessionItem = {
  // Use this tracker id when calling DELETE /api/v1/auth/sessions/:sessionId.
  id: string
  // Informational backend session metadata only. Do not use this for revocation.
  sessionId: string
  ipAddress?: string | null
  userAgent?: string | null
  deviceName?: string | null
  lastSeenAt: string
  expiresAt: string
  isCurrent: boolean
}
