"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BadgeCheck,
  CalendarClock,
  Check,
  KeyRound,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react"

import { Panel } from "@/components/account/panel"
import { AuthInput } from "@/components/auth/auth-ui"
import { useConfirm } from "@/components/lister/confirm-dialog"
import { ListerHero, timeAgo } from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { RowsSkeleton } from "@/components/ui/page-skeletons"
import {
  useChangePassword,
  useLogoutAll,
  useMe,
  useRevokeSession,
  useSessions,
} from "@/features/auth/hooks"
import { describeDevice } from "@/lib/device"
import { cn } from "@/lib/utils"

/** A rough 0 to 4 score: length and variety, nothing fancy. */
function strength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++
  return score
}
const LEVELS = ["Too short", "Weak", "Okay", "Good", "Strong"]

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 text-xs",
        ok ? "text-primary" : "text-muted-foreground"
      )}
    >
      {ok ? (
        <Check className="size-3.5" />
      ) : (
        <X className="size-3.5 opacity-60" />
      )}
      {children}
    </li>
  )
}

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const confirm = useConfirm()

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

  const sessions = sessionsQuery.data ?? []
  const score = newPassword ? strength(newPassword) : 0
  const longEnough = newPassword.length >= 8
  const matches = confirmPassword !== "" && confirmPassword === newPassword
  const canSubmit =
    currentPassword.length > 0 &&
    longEnough &&
    matches &&
    !changePassword.isPending

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    changePassword.mutate({ currentPassword, newPassword })
  }

  return (
    <>
      <ListerHero
        icon={ShieldCheck}
        eyebrow="Account"
        title="Password & security"
        description="Your password and the devices signed in to your account."
        loading={!me}
        stats={[
          {
            label: "Email",
            value: me?.emailVerifiedAt ? "Verified" : "Unverified",
            icon: me?.emailVerifiedAt ? BadgeCheck : ShieldAlert,
            tone: me?.emailVerifiedAt ? "good" : "warn",
            hint: me?.email,
          },
          {
            label: "Devices",
            value: sessionsQuery.isPending ? "…" : sessions.length,
            icon: Laptop,
            hint: "Signed in now",
          },
          {
            label: "Last login",
            value: me?.lastLoginAt ? timeAgo(me.lastLoginAt) : "Now",
            icon: CalendarClock,
          },
          {
            label: "Status",
            value: me
              ? me.status
                  .replaceAll("_", " ")
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())
              : "—",
            icon: ShieldCheck,
            tone: me?.status === "ACTIVE" ? "good" : "warn",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel
          id="password"
          title="Change password"
          description="Your current device stays signed in."
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
            {newPassword ? (
              <div className="flex flex-col gap-2" aria-live="polite">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        i <= score
                          ? score <= 1
                            ? "bg-destructive"
                            : score === 2
                              ? "bg-amber-500"
                              : "bg-primary"
                          : "bg-muted"
                      )}
                    />
                  ))}
                  <span className="ml-1 w-16 text-right text-xs font-medium text-muted-foreground">
                    {LEVELS[score]}
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <Rule ok={longEnough}>8+ characters</Rule>
                  <Rule
                    ok={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)}
                  >
                    Upper and lower case
                  </Rule>
                  <Rule ok={/\d/.test(newPassword)}>A number</Rule>
                  <Rule ok={/[^A-Za-z0-9]/.test(newPassword)}>A symbol</Rule>
                </ul>
              </div>
            ) : null}
            <AuthInput
              id="confirmPassword"
              type="password"
              icon={Lock}
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && !matches ? (
              <p className="text-xs text-destructive">
                Passwords don&apos;t match yet.
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full sm:w-auto sm:self-start"
              disabled={!canSubmit}
            >
              {changePassword.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <KeyRound />
              )}
              Update password
            </Button>
          </form>
        </Panel>

        <Panel
          title="Where you're signed in"
          description="Sign out any device you don't recognise."
          footer={
            <>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0" />
                Changing your password signs out your other devices.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={logoutAll.isPending}
                onClick={() =>
                  confirm.ask({
                    title: "Log out everywhere?",
                    description:
                      "You'll be signed out on every device, including this one, and will need to sign in again.",
                    confirmLabel: "Log out everywhere",
                    tone: "danger",
                    run: () => logoutAll.mutateAsync(),
                  })
                }
              >
                <LogOut /> Log out everywhere
              </Button>
            </>
          }
        >
          {sessionsQuery.isPending ? (
            <RowsSkeleton rows={2} />
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
            <ul className="flex flex-col gap-2.5">
              {sessions.map((session) => {
                const device = describeDevice(
                  session.userAgent,
                  session.deviceName
                )
                const Icon = device.mobile ? Smartphone : Laptop
                const busy = revoke.isPending && revoke.variables === session.id
                return (
                  <li
                    key={session.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3",
                      session.isCurrent
                        ? "border-primary/30 bg-primary/5"
                        : "bg-background/60"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
                        session.isCurrent
                          ? "bg-primary/15 text-primary ring-primary/20"
                          : "bg-muted text-muted-foreground ring-border"
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
                        <span className="truncate">{device.label}</span>
                        {session.isCurrent ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            This device
                          </span>
                        ) : null}
                      </p>
                      {device.detail ? (
                        <p className="text-xs font-medium text-foreground/70">
                          {device.detail}
                        </p>
                      ) : null}
                      <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span>
                          {session.isCurrent
                            ? "Active now"
                            : `Last seen ${timeAgo(session.lastSeenAt)}`}
                        </span>
                        {session.ipAddress ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" aria-hidden />
                            {session.ipAddress}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    {session.isCurrent ? null : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={busy}
                        onClick={() =>
                          confirm.ask({
                            title: "Sign out this device?",
                            description: `${device.label} will be signed out straight away.`,
                            confirmLabel: "Sign out",
                            tone: "danger",
                            run: () => revoke.mutateAsync(session.id),
                          })
                        }
                      >
                        {busy ? <Loader2 className="animate-spin" /> : null}
                        Sign out
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>
      {confirm.dialog}
    </>
  )
}
