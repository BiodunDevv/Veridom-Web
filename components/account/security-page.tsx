"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  KeyRound,
  Loader2,
  Lock,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { RetryState } from "@/components/retry-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthInput } from "@/components/auth/auth-ui"
import { Panel } from "@/components/account/panel"
import {
  useChangePassword,
  useLogoutAll,
  useMe,
  useRevokeSession,
  useSessions,
} from "@/features/auth/hooks"
import { describeDevice } from "@/lib/device"
import { formatDate, getStatusVariant } from "@/lib/format"

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const me = useMe().data
  const sessionsQuery = useSessions()
  const logoutAll = useLogoutAll()
  const revoke = useRevokeSession()
  const changePassword = useChangePassword({
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    },
    onError: (message) => toast.error(message),
  })

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (newPassword.length < 8)
      return toast.error("Use at least 8 characters for your new password.")
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.")
    changePassword.mutate({ currentPassword, newPassword })
  }

  const sessions = sessionsQuery.data ?? []

  return (
    <>
      <PageHeader
        title="Password & security"
        description="Your password and the devices signed in to your account."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Your account"
          description="Details from your current session."
        >
          <dl className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {[
              { label: "Email", value: me?.email ?? "—" },
              { label: "Last login", value: formatDate(me?.lastLoginAt) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-muted/60 p-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold break-all">
                  {item.value}
                </dd>
              </div>
            ))}
            <div className="rounded-xl bg-muted/60 p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Status
              </dt>
              <dd className="mt-1.5">
                {me ? (
                  <Badge variant={getStatusVariant(me.status)}>
                    {me.status.replaceAll("_", " ")}
                  </Badge>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel
          id="password"
          title="Change password"
          description="Your current session stays signed in."
        >
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <AuthInput
              id="currentPassword"
              type="password"
              icon={Lock}
              label="Current password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <AuthInput
              id="newPassword"
              type="password"
              icon={Lock}
              label="New password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <AuthInput
              id="confirmPassword"
              type="password"
              icon={Lock}
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              className="self-start"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              Update password
            </Button>
          </form>
        </Panel>
      </div>

      <Panel
        title="Active sessions"
        description="Review and revoke browser sessions signed in to your account."
        footer={
          <>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              Password changes keep the current session alive.
            </p>
            <Button
              variant="outline"
              onClick={() => logoutAll.mutate()}
              disabled={logoutAll.isPending}
            >
              {logoutAll.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Log out everywhere
            </Button>
          </>
        }
      >
        {sessionsQuery.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading sessions…
          </div>
        ) : sessionsQuery.error ? (
          <RetryState
            label="your sessions"
            onRetry={() => sessionsQuery.refetch()}
          />
        ) : sessions.length === 0 ? (
          <p className="rounded-xl bg-muted/60 px-4 py-5 text-sm text-muted-foreground">
            No active sessions found.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => {
              const device = describeDevice(session.userAgent)
              const Icon = device.mobile ? Smartphone : Monitor
              const busy = revoke.isPending && revoke.variables === session.id
              return (
                <li
                  key={session.id}
                  className="flex flex-col gap-3 rounded-xl bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {session.deviceName || device.label}
                        </p>
                        <Badge
                          variant={session.isCurrent ? "default" : "outline"}
                        >
                          {session.isCurrent ? "This device" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last seen {formatDate(session.lastSeenAt)} · expires{" "}
                        {formatDate(session.expiresAt)}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent ? null : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => revoke.mutate(session.id)}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Revoke
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </>
  )
}
