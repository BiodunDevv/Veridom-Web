"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { organizationsApi, type Permission } from "@/lib/api/organizations"
import { queryKeys } from "@/lib/query/keys"
import { useAction } from "@/lib/query/use-action"

export const useMine = () =>
  useQuery({
    queryKey: queryKeys.org.mine,
    queryFn: organizationsApi.mine,
    retry: false,
  })

export const useActiveOrg = (activeId: string | null) =>
  useQuery({
    queryKey: queryKeys.org.active(activeId),
    queryFn: organizationsApi.active,
    enabled: Boolean(activeId),
    retry: false,
  })

/** Permissions of the person's role in the lister they are acting as. */
export function usePermissions() {
  const mine = useMine()
  const active = useActiveOrg(mine.data?.activeOrganizationId ?? null)
  const permissions = new Set<Permission>(active.data?.permissions ?? [])

  return {
    isLoading:
      mine.isPending ||
      (Boolean(mine.data?.activeOrganizationId) && active.isPending),
    org: active.data?.organization,
    can: (...keys: Permission[]) => keys.some((key) => permissions.has(key)),
  }
}

export function useSwitchOrg(onDone?: (id: string | null) => void) {
  const queryClient = useQueryClient()
  return useAction(
    (id: string | null) => organizationsApi.setActive(id).then(() => id),
    {
      onSuccess: async (id) => {
        await queryClient.invalidateQueries({ queryKey: ["org"] })
        await queryClient.invalidateQueries({ queryKey: ["lister"] })
        onDone?.(id)
      },
    }
  )
}

export const useCreateOrg = (onDone?: () => void) =>
  useAction((name: string) => organizationsApi.create(name), {
    success: "Lister created. You're its owner.",
    invalidate: [["org"]],
    onSuccess: () => onDone?.(),
  })

export const useUpdateOrg = () =>
  useAction(organizationsApi.update, {
    success: "Lister details saved.",
    invalidate: [["org"]],
  })

export const useRoles = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.org.roles,
    queryFn: organizationsApi.roles,
    enabled,
  })
export const useMembers = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.org.members,
    queryFn: organizationsApi.members,
    enabled,
  })
export const useInvites = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.org.invites,
    queryFn: organizationsApi.invites,
    enabled,
  })

export const useCreateRole = () =>
  useAction(organizationsApi.createRole, {
    success: "Role created.",
    invalidate: [queryKeys.org.roles],
  })
export const useUpdateMember = () =>
  useAction(
    ({
      id,
      ...body
    }: {
      id: string
      roleId?: string
      status?: "ACTIVE" | "SUSPENDED"
    }) => organizationsApi.updateMember(id, body),
    {
      success: "Member updated.",
      invalidate: [queryKeys.org.members, queryKeys.org.roles],
    }
  )
export const useRemoveMember = () =>
  useAction(organizationsApi.removeMember, {
    success: "Member removed.",
    invalidate: [queryKeys.org.members, queryKeys.org.roles],
  })
export const useInviteMember = () =>
  useAction(organizationsApi.invite, {
    success: "Invitation sent.",
    invalidate: [queryKeys.org.invites],
  })
export const useRevokeInvite = () =>
  useAction(organizationsApi.revokeInvite, {
    success: "Invitation revoked.",
    invalidate: [queryKeys.org.invites],
  })

export const useUpdateRole = () =>
  useAction(
    ({
      id,
      ...body
    }: {
      id: string
      name?: string
      permissions?: Permission[]
    }) => organizationsApi.updateRole(id, body),
    {
      success: "Role updated.",
      invalidate: [queryKeys.org.roles],
    }
  )
export const useDeleteRole = () =>
  useAction(organizationsApi.deleteRole, {
    success: "Role deleted.",
    invalidate: [queryKeys.org.roles],
  })

export const useAuditLogs = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.org.audit,
    queryFn: () => organizationsApi.auditLogs(50),
    enabled,
  })

export const useAcceptInvite = (onDone: () => void) =>
  useAction(organizationsApi.acceptInvite, {
    success: "You've joined the lister.",
    invalidate: [["org"]],
    onSuccess: onDone,
  })
