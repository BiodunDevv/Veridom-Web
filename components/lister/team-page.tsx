"use client"

import * as React from "react"
import {
  Building2,
  CalendarCheck,
  Clock3,
  Crown,
  Loader2,
  Lock,
  Mail,
  MailPlus,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react"

import { ListerHero, initialsOf } from "@/components/lister/lister-ui"
import { FormSelect } from "@/components/site/form-select"
import { inputClass } from "@/components/site/field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RowsSkeleton } from "@/components/ui/page-skeletons"
import { useConfirm } from "@/components/lister/confirm-dialog"
import { RoleDialog } from "@/components/lister/role-dialog"
import {
  useDeleteRole,
  useInviteMember,
  useInvites,
  useMembers,
  usePermissions,
  useRemoveMember,
  useRevokeInvite,
  useRoles,
  useUpdateMember,
} from "@/features/lister/org-hooks"
import type { Permission } from "@/lib/api/organizations"
import { PERMISSION_GROUPS } from "@/lib/permissions"
import { cn } from "@/lib/utils"

const Panel = ({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}) => (
  <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
    {children}
  </section>
)

const GROUP_ICON: Record<string, LucideIcon> = {
  Listings: Building2,
  Renting: CalendarCheck,
  Inquiries: MessageSquare,
  Team: Users,
  Lister: Settings2,
}

/** Small chips showing which areas a role touches, e.g. "Listings 3". */
function RoleAreas({ permissions }: { permissions: Permission[] }) {
  const set = new Set(permissions)
  const areas = PERMISSION_GROUPS.map((g) => ({
    label: g.label,
    n: g.keys.filter((k) => set.has(k)).length,
    of: g.keys.length,
  })).filter((g) => g.n)
  return (
    <ul className="flex flex-wrap gap-1.5">
      {areas.map((area) => {
        const Icon = GROUP_ICON[area.label] ?? ShieldCheck
        return (
          <li
            key={area.label}
            className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium"
          >
            <Icon className="size-3.5 text-primary" aria-hidden />
            {area.label}
            <span className="text-muted-foreground tabular-nums">
              {area.n}/{area.of}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function TeamPage() {
  const { can, org } = usePermissions()
  const confirm = useConfirm()
  const manage = can("member:manage")
  const invite = can("member:invite")
  const roles =
    useRoles(can("role:manage", "member:invite", "member:manage")).data ?? []
  const membersQuery = useMembers(can("member:manage", "member:invite"))
  const members = membersQuery.data ?? []
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
      <ListerHero
        icon={Users}
        eyebrow="Team"
        title="Team"
        description="People, invitations and what each role can do."
        stats={[
          {
            label: "Members",
            value: members.length,
            icon: Users,
            tone: "good",
          },
          {
            label: "Pending invites",
            value: invites.length,
            icon: MailPlus,
            tone: invites.length ? "warn" : "default",
            hint: "Invites last 7 days",
          },
          { label: "Roles", value: roles.length, icon: ShieldCheck },
          {
            label: "Suspended",
            value: members.filter((m) => m.status === "SUSPENDED").length,
            icon: Users,
          },
        ]}
      />

      <Panel
        title="Members"
        description="Everyone who can work in this lister."
      >
        {membersQuery.isLoading ? <RowsSkeleton rows={2} /> : null}
        <ul className="flex flex-col gap-2.5">
          {members.map((member) => {
            const fullName = `${member.firstName} ${member.lastName}`
            const suspended = member.status === "SUSPENDED"
            const isOwner = member.roleName === "Owner"
            return (
              <li
                key={member.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between",
                  suspended ? "bg-destructive/5" : "bg-background/60"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "relative grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold ring-1",
                      suspended
                        ? "bg-muted text-muted-foreground ring-border"
                        : "bg-primary/10 text-primary ring-primary/15"
                    )}
                  >
                    {initialsOf(fullName)}
                    {isOwner ? (
                      <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-amber-500 text-white ring-2 ring-card">
                        <Crown className="size-3" aria-hidden />
                      </span>
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-semibold">
                      {fullName}
                      {suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : null}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                {manage ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <FormSelect
                      aria-label={`Role for ${member.firstName}`}
                      placeholder="Role"
                      value={member.roleId}
                      options={roleOptions}
                      wrapperClassName="w-full sm:w-40"
                      className="h-9"
                      onChange={(e) =>
                        update.mutate({ id: member.id, roleId: e.target.value })
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        suspended
                          ? update.mutate({ id: member.id, status: "ACTIVE" })
                          : confirm.ask({
                              title: `Suspend ${member.firstName}?`,
                              description: `${fullName} won't be able to use this lister until you reinstate them. Their listings and history stay as they are.`,
                              confirmLabel: "Suspend",
                              tone: "danger",
                              run: () =>
                                update.mutateAsync({
                                  id: member.id,
                                  status: "SUSPENDED",
                                }),
                            })
                      }
                    >
                      {suspended ? "Reinstate" : "Suspend"}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Remove ${fullName}`}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        confirm.ask({
                          title: `Remove ${member.firstName}?`,
                          description: `${fullName} will lose access to ${org?.name ?? "this lister"} straight away. You can invite them again later.`,
                          confirmLabel: "Remove member",
                          tone: "danger",
                          run: () => remove.mutateAsync(member.id),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline">{member.roleName}</Badge>
                )}
              </li>
            )
          })}
        </ul>
      </Panel>

      {invite ? (
        <Panel
          title="Invitations"
          description="Invite people by email. Invites last 7 days."
        >
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
            <ul className="flex flex-col gap-2">
              {invites.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed bg-muted/30 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Clock3 className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Waiting to join as {item.roleName ?? "member"}
                        {item.expiresAt
                          ? ` · expires ${new Date(item.expiresAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" })}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      confirm.ask({
                        title: "Revoke this invitation?",
                        description: `${item.email} won't be able to join with the link they were sent.`,
                        confirmLabel: "Revoke invite",
                        tone: "danger",
                        run: () => revoke.mutateAsync(item.id),
                      })
                    }
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
              No pending invitations.
            </p>
          )}
        </Panel>
      ) : null}

      {roles.length ? (
        <Panel
          title="Roles"
          description="What each role is allowed to do."
          action={can("role:manage") ? <RoleDialog /> : null}
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => {
              const owner = role.isSystem && role.name === "Owner"
              return (
                <li
                  key={role.id}
                  className="flex flex-col gap-3 rounded-xl border bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
                          owner
                            ? "bg-amber-500/15 text-amber-600 ring-amber-500/20 dark:text-amber-400"
                            : "bg-primary/10 text-primary ring-primary/15"
                        )}
                      >
                        {owner ? (
                          <Crown className="size-5" aria-hidden />
                        ) : (
                          <ShieldCheck className="size-5" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.memberCount} member
                          {role.memberCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    {owner ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        <Lock className="size-3" aria-hidden /> Locked
                      </span>
                    ) : null}
                  </div>

                  {owner ? (
                    <p className="text-sm text-muted-foreground">
                      Everything in this lister. This role can&apos;t be
                      changed.
                    </p>
                  ) : (
                    <RoleAreas permissions={role.permissions} />
                  )}

                  {can("role:manage") && !owner ? (
                    <div className="mt-auto flex items-center gap-1 border-t pt-3">
                      <RoleDialog role={role} />
                      {!role.isSystem ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deleteRole.isPending}
                          onClick={() =>
                            confirm.ask({
                              title: `Delete the ${role.name} role?`,
                              description:
                                role.memberCount > 0
                                  ? `${role.memberCount} ${role.memberCount === 1 ? "person has" : "people have"} this role. Move them to another role first, or the delete will be refused.`
                                  : "This can't be undone. Nobody has this role right now.",
                              confirmLabel: "Delete role",
                              tone: "danger",
                              run: () => deleteRole.mutateAsync(role.id),
                            })
                          }
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Panel>
      ) : null}

      {confirm.dialog}
    </>
  )
}
