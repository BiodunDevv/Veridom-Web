"use client"

import * as React from "react"
import { Loader2, Mail, Plus, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { FormSelect } from "@/components/site/form-select"
import { inputClass } from "@/components/site/field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Role } from "@/lib/api/organizations"
import {
  useCreateRole,
  useDeleteRole,
  useInviteMember,
  useUpdateRole,
  useInvites,
  useMembers,
  usePermissions,
  useRemoveMember,
  useRevokeInvite,
  useRoles,
  useUpdateMember,
} from "@/features/lister/org-hooks"
import { PERMISSIONS, type Permission } from "@/lib/api/organizations"
import { cn } from "@/lib/utils"

const Panel = ({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) => (
  <section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

function RoleDialog({ role }: { role?: Role }) {
  const { can } = usePermissions()
  const create = useCreateRole()
  const update = useUpdateRole()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(role?.name ?? "")
  const [picked, setPicked] = React.useState<Permission[]>(
    role?.permissions ?? []
  )
  const pending = create.isPending || update.isPending
  const done = {
    onSuccess: () => {
      setOpen(false)
      if (!role) {
        setName("")
        setPicked([])
      }
    },
  }
  // You can only grant permissions you hold yourself.
  const grantable = PERMISSIONS.filter((p) => can(p))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {role ? (
          <Button size="sm" variant="ghost">
            Edit
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <Plus /> New role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{role ? `Edit ${role.name}` : "New role"}</DialogTitle>
          <DialogDescription>
            Choose what people with this role can do.
          </DialogDescription>
        </DialogHeader>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Role name"
          aria-label="Role name"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2">
          {grantable.map((permission) => {
            const on = picked.includes(permission)
            return (
              <button
                key={permission}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setPicked(
                    on
                      ? picked.filter((p) => p !== permission)
                      : [...picked, permission]
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-accent"
                )}
              >
                {permission}
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <Button
            disabled={name.trim().length < 2 || picked.length === 0 || pending}
            onClick={() =>
              role
                ? update.mutate(
                    { id: role.id, name: name.trim(), permissions: picked },
                    done
                  )
                : create.mutate(
                    { name: name.trim(), permissions: picked },
                    done
                  )
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}{" "}
            {role ? "Save role" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TeamPage() {
  const { can } = usePermissions()
  const manage = can("member:manage")
  const invite = can("member:invite")
  const roles =
    useRoles(can("role:manage", "member:invite", "member:manage")).data ?? []
  const members = useMembers(can("member:manage", "member:invite")).data ?? []
  const invites = useInvites(can("member:invite", "member:manage")).data ?? []
  const update = useUpdateMember()
  const remove = useRemoveMember()
  const sendInvite = useInviteMember()
  const revoke = useRevokeInvite()
  const deleteRole = useDeleteRole()
  const [email, setEmail] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))

  return (
    <>
      <PageHeader
        title="Team"
        description="People, invitations and what each role can do."
      />

      <Panel title="Members">
        <ul className="divide-y">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {member.firstName} {member.lastName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {member.status === "SUSPENDED" ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : null}
                {manage ? (
                  <>
                    <FormSelect
                      aria-label={`Role for ${member.firstName}`}
                      placeholder="Role"
                      value={member.roleId}
                      options={roleOptions}
                      wrapperClassName="w-40"
                      className="h-9"
                      onChange={(e) =>
                        update.mutate({ id: member.id, roleId: e.target.value })
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update.mutate({
                          id: member.id,
                          status:
                            member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                        })
                      }
                    >
                      {member.status === "ACTIVE" ? "Suspend" : "Reinstate"}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Remove member"
                      onClick={() => remove.mutate(member.id)}
                    >
                      <Trash2 />
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline">{member.roleName}</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {invite ? (
        <Panel title="Invitations">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              sendInvite.mutate(
                { email: email.trim(), roleId },
                { onSuccess: () => setEmail("") }
              )
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              className={cn(inputClass, "flex-1")}
            />
            <FormSelect
              aria-label="Role"
              placeholder="Role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              options={roleOptions}
              wrapperClassName="sm:w-48"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!email || !roleId || sendInvite.isPending}
            >
              {sendInvite.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail />
              )}{" "}
              Invite
            </Button>
          </form>
          {invites.length ? (
            <ul className="divide-y">
              {invites.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="truncate">
                    {item.email}{" "}
                    <span className="text-muted-foreground">
                      · {item.roleName}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => revoke.mutate(item.id)}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pending invitations. Invites last 7 days.
            </p>
          )}
        </Panel>
      ) : null}

      {roles.length ? (
        <Panel
          title="Roles"
          action={can("role:manage") ? <RoleDialog /> : null}
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => (
              <li
                key={role.id}
                className="flex flex-col gap-2 rounded-lg bg-muted/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{role.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {role.memberCount} member{role.memberCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role.isSystem && role.name === "Owner"
                    ? "Everything. Locked."
                    : `${role.permissions.length} permissions`}
                </p>
                {can("role:manage") && role.name !== "Owner" ? (
                  <div className="flex gap-1">
                    <RoleDialog role={role} />
                    {!role.isSystem ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deleteRole.isPending}
                        onClick={() => deleteRole.mutate(role.id)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </>
  )
}
