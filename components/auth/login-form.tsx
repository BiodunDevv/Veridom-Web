"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lock, AtSign } from "lucide-react"
import { toast } from "sonner"

import {
  clearAuthState,
  setAuthErrorCode,
  setAuthInitialized,
  setAuthUser,
} from "@/features/auth/auth-slice"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage, isApiError } from "@/lib/api/client"
import { takeApiMessage } from "@/lib/api/last-message"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import { CookieHelp } from "@/components/auth/cookie-help"
import type { EmbeddedAuth } from "@/components/auth/auth-modal-types"
import {
  AuthButton,
  AuthDivider,
  AuthFooterText,
  AuthHeading,
  AuthInput,
  AuthOutlineButton,
  GoogleIcon,
  authLinkClass,
} from "@/components/auth/auth-ui"
export function LoginForm({ embedded }: { embedded?: EmbeddedAuth }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const redirectPath = useAppSelector((state) => state.auth.redirectPath)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const [cookieBlocked, setCookieBlocked] = React.useState(false)

  // Load the session after login; a 401 here means the cookie was not kept.
  const completeSignIn = async () => {
    try {
      const currentUser = await queryClient.fetchQuery({
        queryKey: ["me"],
        queryFn: authApi.me,
        staleTime: 0,
      })

      dispatch(setAuthUser(currentUser))
      dispatch(setAuthInitialized(true))
      dispatch(setAuthErrorCode(null))
      setCookieBlocked(false)
      await queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast.success("Welcome back", {
        description: takeApiMessage("Welcome back"),
      })
      const next = new URLSearchParams(window.location.search).get("next")
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null
      embedded?.close()
      if (safeNext || !embedded) {
        router.push(safeNext ?? redirectPath ?? "/account")
      }
    } catch (error) {
      dispatch(clearAuthState())
      if (isApiError(error) && error.status === 401) {
        setCookieBlocked(true)
        return
      }
      dispatch(
        setAuthErrorCode(isApiError(error) ? error.code : "LOGIN_FAILED")
      )
      toast.error(getApiErrorMessage(error, "Login failed."))
      await authApi.logout().catch(() => undefined)
    }
  }

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (user) => {
      // Unverified accounts have no session yet: send them to the code step.
      if (user.status === "PENDING_VERIFICATION") {
        const mail = user.email || email.trim()
        authApi.resendVerification({ email: mail }).catch(() => undefined)
        toast.warning("Verify your email to continue", {
          description: `We sent a new 6-digit code to ${mail}.`,
        })
        if (embedded) {
          embedded.switchTo("verify", mail)
        } else {
          router.push(`/auth/verify-email?email=${encodeURIComponent(mail)}`)
        }
        return
      }

      await completeSignIn()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Login failed."))
      dispatch(
        setAuthErrorCode(isApiError(error) ? error.code : "LOGIN_FAILED")
      )
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Email address is required.")
      return
    }

    if (!password) {
      toast.error("Enter your password.")
      return
    }

    loginMutation.mutate({ email: email.trim(), password })
  }

  const comingSoon = (provider: string) =>
    toast.info(`${provider} sign-in isn't available yet.`)

  if (cookieBlocked) {
    return (
      <CookieHelp
        onRetry={completeSignIn}
        onBack={() => setCookieBlocked(false)}
      />
    )
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <AuthHeading
        title={embedded ? "Welcome back" : "Sign In or Join Now!"}
        description="Sign in or create your Veridom account to get started."
      />

      <div className="flex flex-col gap-3">
        <AuthInput
          id="email"
          type="email"
          icon={AtSign}
          label="Enter your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <AuthInput
          id="password"
          type="password"
          icon={Lock}
          label="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <div className="-mt-1 flex justify-end text-sm">
          <Link
            href="/auth/forgot-password"
            className={authLinkClass}
            onClick={embedded?.close}
          >
            Forgot password?
          </Link>
        </div>
        <AuthButton type="submit" loading={loginMutation.isPending}>
          Continue With Email
        </AuthButton>
      </div>

      <AuthDivider>Or continue with</AuthDivider>

      <AuthOutlineButton
        className="w-full flex-none"
        onClick={() => comingSoon("Google")}
      >
        <GoogleIcon className="size-[18px]" />
        Continue with Google
      </AuthOutlineButton>

      <AuthFooterText>
        New to Veridom?{" "}
        {embedded ? (
          <button
            type="button"
            className={authLinkClass}
            onClick={() => embedded.switchTo("register")}
          >
            Create an account
          </button>
        ) : (
          <Link href="/?auth=register" className={authLinkClass}>
            Create an account
          </Link>
        )}
      </AuthFooterText>
    </form>
  )
}
