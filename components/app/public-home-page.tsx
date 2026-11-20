"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  KeyRound,
  Loader2,
  LogOut,
  Monitor,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import {
  clearAuthState,
  setAuthInitialized,
  setAuthUser,
} from "@/features/auth/auth-slice"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage, isApiError } from "@/lib/api/client"
import type { SessionItem, UserStatus } from "@/lib/api/types"
import { useAppDispatch } from "@/lib/store/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { ThemeToggleButton } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Not available"
  }

  return new Date(value).toLocaleString()
}

const getStatusVariant = (
  status: UserStatus,
): "default" | "secondary" | "destructive" => {
  if (status === "ACTIVE") {
    return "default"
  }

  if (status === "PENDING_VERIFICATION") {
    return "secondary"
  }

  return "destructive"
}

type SessionListProps = {
  sessions: SessionItem[]
  revokingSessionTrackerId: string | null
  onRevoke: (sessionTrackerId: string) => void
}

function SessionList({
  sessions,
  revokingSessionTrackerId,
  onRevoke,
}: SessionListProps) {
  if (!sessions.length) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
        No active sessions found.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex flex-col gap-3 rounded-lg border border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Monitor className="size-4 text-muted-foreground" />
              <p className="font-medium text-foreground">
                {session.deviceName || session.userAgent || "Browser session"}
              </p>
              <Badge
                variant={session.isCurrent ? "default" : "outline"}
              >
                {session.isCurrent ? "Current" : "Active"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Last tracked: {formatDate(session.lastSeenAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              Expires: {formatDate(session.expiresAt)}
            </p>
            <p className="text-xs break-all text-muted-foreground">
              Session reference: {session.sessionId}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={session.isCurrent || revokingSessionTrackerId === session.id}
            onClick={() => onRevoke(session.id)}
          >
            {revokingSessionTrackerId === session.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {session.isCurrent ? "Current session" : "Revoke"}
          </Button>
        </div>
      ))}
    </div>
  )
}

export function PublicHomePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [passwordError, setPasswordError] = React.useState<string | null>(null)

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
  })

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: authApi.listSessions,
    enabled: Boolean(meQuery.data),
  })

  React.useEffect(() => {
    if (meQuery.data) {
      dispatch(setAuthUser(meQuery.data))
      dispatch(setAuthInitialized(true))
      return
    }

    if (meQuery.isError) {
      dispatch(clearAuthState())
    }
  }, [dispatch, meQuery.data, meQuery.isError])

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      dispatch(clearAuthState())
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      await queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("You have been signed out.")
      router.push("/auth/login")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not sign you out."))
    },
  })

  const logoutAllMutation = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: async () => {
      dispatch(clearAuthState())
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      await queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("All sessions were revoked.")
      router.push("/auth/login")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not revoke sessions."))
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordError(null)
      await queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Password changed successfully.")
    },
    onError: (error) => {
      setPasswordError(
        getApiErrorMessage(error, "Could not change your password."),
      )
    },
  })

  const revokeSessionMutation = useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Session revoked.")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not revoke the session."))
    },
  })

  const resendVerificationMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      toast.success("If your account is eligible, a verification email has been sent.")
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Could not resend the verification email."),
      )
    },
  })

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    })
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const guestMode =
    meQuery.isError &&
    isApiError(meQuery.error) &&
    (meQuery.error.status === 401 || meQuery.error.code === "AUTH_REQUIRED")
  const suspendedMode =
    meQuery.isError &&
    isApiError(meQuery.error) &&
    meQuery.error.code === "ACCOUNT_SUSPENDED"

  if (meQuery.isPending) {
    return (
      <main className="min-h-svh bg-background px-6 py-10">
        <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-5xl items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading your account...
          </div>
        </div>
      </main>
    )
  }

  if (!meQuery.data) {
    if (suspendedMode) {
      return (
        <main className="min-h-svh bg-background px-6 py-10">
          <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-5xl items-center justify-center">
            <Card className="w-full max-w-xl">
              <CardHeader>
                <CardTitle>Account temporarily unavailable</CardTitle>
                <CardDescription>
                  This session still exists, but the backend is blocking access to protected routes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>Account suspended</AlertTitle>
                  <AlertDescription>
                    {getApiErrorMessage(
                      meQuery.error,
                      "Your account is currently suspended.",
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Sign out
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      )
    }

    return (
      <main className="min-h-svh bg-background px-6 py-10">
        <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-5xl items-center">
          <Card className="w-full">
            <CardHeader className="gap-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Logo className="size-10" />
                  <div>
                    <CardTitle className="text-xl">Veridom</CardTitle>
                    <CardDescription>
                      Tenant and landlord access, registration, and recovery
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={backendUrl ? "default" : "outline"}>
                  {backendUrl ? "Backend connected" : "Backend not configured"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Property onboarding and secure account access live here.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  Sign in, register as a tenant or landlord, recover your
                  password, and verify your email without leaving the existing
                  Veridom design system.
                </p>
                {!guestMode && meQuery.error ? (
                  <Alert variant="destructive" className="max-w-2xl">
                    <AlertTitle>Backend connection problem</AlertTitle>
                    <AlertDescription>
                      {getApiErrorMessage(
                        meQuery.error,
                        "We could not reach the backend.",
                      )}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="h-12 rounded-lg px-6 font-semibold">
                  <Link href="/auth/register">Create account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-lg px-6 font-semibold"
                >
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card>
          <CardHeader className="gap-4 border-b">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Logo className="size-10" />
                <div>
                  <CardTitle className="text-xl">
                    {meQuery.data.firstName} {meQuery.data.lastName}
                  </CardTitle>
                  <CardDescription>
                    {meQuery.data.role} account for {meQuery.data.email}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggleButton />
                <Badge variant={getStatusVariant(meQuery.data.status)}>
                  {meQuery.data.status.replaceAll("_", " ")}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() =>
                    Promise.all([
                      queryClient.invalidateQueries({ queryKey: ["me"] }),
                      queryClient.invalidateQueries({ queryKey: ["sessions"] }),
                    ])
                  }
                >
                  <RefreshCcw className="size-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 py-6 md:grid-cols-3">
            <div className="rounded-lg border border-border px-4 py-4">
              <p className="text-sm text-muted-foreground">Email verification</p>
              <p className="mt-2 text-lg font-medium">
                {meQuery.data.emailVerifiedAt ? "Verified" : "Pending"}
              </p>
              {!meQuery.data.emailVerifiedAt ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    resendVerificationMutation.mutate({
                      email: meQuery.data.email,
                    })
                  }
                  disabled={resendVerificationMutation.isPending}
                >
                  {resendVerificationMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Resend verification
                </Button>
              ) : null}
            </div>
            <div className="rounded-lg border border-border px-4 py-4">
              <p className="text-sm text-muted-foreground">Last login</p>
              <p className="mt-2 text-lg font-medium">
                {formatDate(meQuery.data.lastLoginAt)}
              </p>
            </div>
            <div className="rounded-lg border border-border px-4 py-4">
              <p className="text-sm text-muted-foreground">Active sessions</p>
              <p className="mt-2 text-lg font-medium">
                {sessionsQuery.data?.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Account details</CardTitle>
                <CardDescription>
                  Your account is hydrated directly from `/api/v1/auth/me`.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border px-4 py-4">
                  <p className="text-sm text-muted-foreground">Full name</p>
                  <p className="mt-2 font-medium">
                    {meQuery.data.firstName} {meQuery.data.lastName}
                  </p>
                </div>
                <div className="rounded-lg border border-border px-4 py-4">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="mt-2 font-medium">{meQuery.data.email}</p>
                </div>
                <div className="rounded-lg border border-border px-4 py-4">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="mt-2 font-medium">
                    {meQuery.data.phone || "Not set"}
                  </p>
                </div>
                <div className="rounded-lg border border-border px-4 py-4">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="mt-2 font-medium">
                    {formatDate(meQuery.data.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Change password</CardTitle>
                  <CardDescription>
                    Your current session stays active while other sessions are
                    revoked.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleChangePassword}>
                    {passwordError ? (
                      <Alert variant="destructive">
                        <AlertTitle>Password update failed</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    ) : null}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="currentPassword">
                        Current password
                      </label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="newPassword">
                        New password
                      </label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="confirmNewPassword">
                        Confirm new password
                      </label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <KeyRound className="size-4" />
                      )}
                      Update password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active sessions</CardTitle>
                  <CardDescription>
                    Review signed-in browsers and revoke the ones you no longer use.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionsQuery.isPending ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading sessions...
                    </div>
                  ) : sessionsQuery.error ? (
                    <Alert variant="destructive">
                      <AlertTitle>Could not load sessions</AlertTitle>
                      <AlertDescription>
                        {getApiErrorMessage(
                          sessionsQuery.error,
                          "We could not retrieve your active sessions.",
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <SessionList
                      sessions={sessionsQuery.data ?? []}
                      revokingSessionTrackerId={revokeSessionMutation.variables ?? null}
                      onRevoke={(sessionTrackerId) =>
                        revokeSessionMutation.mutate(sessionTrackerId)
                      }
                    />
                  )}
                </CardContent>
                <CardFooter className="justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Current session remains active after password changes.
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => logoutAllMutation.mutate()}
                    disabled={logoutAllMutation.isPending}
                  >
                    {logoutAllMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Logout everywhere
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
