import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"

export const PERMISSIONS = [
  "listing:create",
  "listing:update:any",
  "listing:update:assigned",
  "listing:close",
  "media:manage",
  "inquiry:read:any",
  "inquiry:read:assigned",
  "inquiry:respond",
  "inspection:manage",
  "deal:manage",
  "payout:manage",
  "member:invite",
  "member:manage",
  "role:manage",
  "org:update",
  "org:audit:read",
] as const

export type Permission = (typeof PERMISSIONS)[number]

export type Membership = {
  organizationId: string
  name: string
  slug: string
  roleId: string
  roleName: string
  isOwner: boolean
}
export type Mine = {
  organizations: Membership[]
  activeOrganizationId: string | null
}
export type Organization = {
  id: string
  name: string
  slug?: string
  contactEmail?: string | null
  contactPhone?: string | null
}
export type ActiveOrg = {
  organization: Organization
  role?: { id?: string; name?: string } | string
  permissions: Permission[]
}
export type Role = {
  id: string
  name: string
  isSystem: boolean
  permissions: Permission[]
  memberCount: number
}
export type Member = {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  status: "ACTIVE" | "SUSPENDED"
  roleId: string
  roleName: string
}
export type AuditLog = {
  id: string
  action?: string
  actorName?: string
  createdAt?: string
  summary?: string
}
export type Invite = {
  id: string
  email: string
  roleId?: string
  roleName?: string
  expiresAt?: string
}

const get = async <T>(path: string) =>
  (await apiRequest<ApiSuccess<T>>(path)).data
const send = <T>(method: string, path: string, body?: unknown) =>
  apiRequest<ApiSuccess<T>>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => r.data)

const ORG = "/api/v1/organizations"

export const organizationsApi = {
  mine: () => get<Mine>(`${ORG}/mine`),
  create: (name: string) => send<Organization>("POST", ORG, { name }),
  setActive: (organizationId: string | null) =>
    send<{ activeOrganizationId: string | null; permissions?: Permission[] }>(
      "POST",
      `${ORG}/active`,
      { organizationId }
    ),
  active: () => get<ActiveOrg>(`${ORG}/active`),
  update: (body: {
    name?: string
    contactEmail?: string
    contactPhone?: string
  }) => send<Organization>("PATCH", `${ORG}/active`, body),
  roles: () => get<Role[]>(`${ORG}/active/roles`),
  createRole: (body: { name: string; permissions: Permission[] }) =>
    send<Role>("POST", `${ORG}/active/roles`, body),
  updateRole: (
    id: string,
    body: { name?: string; permissions?: Permission[] }
  ) => send<Role>("PATCH", `${ORG}/active/roles/${id}`, body),
  deleteRole: (id: string) =>
    send<unknown>("DELETE", `${ORG}/active/roles/${id}`),
  auditLogs: (limit = 25, before?: string) =>
    get<AuditLog[]>(
      `${ORG}/active/audit-logs?limit=${limit}${before ? `&before=${before}` : ""}`
    ),
  members: () => get<Member[]>(`${ORG}/active/members`),
  updateMember: (
    id: string,
    body: { roleId?: string; status?: "ACTIVE" | "SUSPENDED" }
  ) => send<Member>("PATCH", `${ORG}/active/members/${id}`, body),
  removeMember: (id: string) =>
    send<unknown>("DELETE", `${ORG}/active/members/${id}`),
  invites: () => get<Invite[]>(`${ORG}/active/invites`),
  invite: (body: { email: string; roleId: string }) =>
    send<Invite>("POST", `${ORG}/active/invites`, body),
  revokeInvite: (id: string) =>
    send<unknown>("DELETE", `${ORG}/active/invites/${id}`),
  acceptInvite: (token: string) =>
    send<unknown>("POST", `${ORG}/invites/accept`, { token }),
}
