"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lock, AtSign, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import {
  clearAuthState,
  setAuthErrorCode,
  setAuthInitialized,
  setAuthUser,
} from "@/features/auth/auth-slice"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage, isApiError } from "@/lib/api/client"
import { useAppDispatch, useAppSelector } from "@/lib/store/store"
import {
  AuthButton,
  AuthDivider,
  AuthFooterText,
  AuthHeading,
  AuthInput,
  AuthNotice,
  AuthOutlineButton,
  GithubIcon,
  GoogleIcon,
  authLinkClass,
} from "@/components/auth/auth-ui"

export function LoginForm() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const redirectPath = useAppSelector((state) => state.auth.redirectPath)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      try {
        const currentUser = await queryClient.fetchQuery({
          queryKey: ["me"],
          queryFn: authApi.me,
        })

        dispatch(setAuthUser(currentUser))
        dispatch(setAuthInitialized(true))
        dispatch(setAuthErrorCode(null))
        await queryClient.invalidateQueries({ queryKey: ["sessions"] })
        toast.success("Welcome back.")
        router.push(redirectPath ?? "/account")
      } catch (error) {
        dispatch(clearAuthState())
        dispatch(
          setAuthErrorCode(isApiError(error) ? error.code : "LOGIN_FAILED"),
        )
        setErrorMessage(getApiErrorMessage(error, "Login failed."))
        await authApi.logout().catch(() => undefined)
      }
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Login failed."))
      dispatch(
        setAuthErrorCode(isApiError(error) ? error.code : "LOGIN_FAILED"),
      )
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage("Email address is required.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Enter the password you signed up with.")
      return
    }

    loginMutation.mutate({ email: email.trim(), password })
  }

  const comingSoon = (provider: string) =>
    toast.info(`${provider} sign-in isn't available yet.`)

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <AuthHeading
        title="Sign In or Join Now!"
        description="Sign in or create your Veridom account to get started."
      />

      <div className="flex flex-col gap-3">
        {errorMessage ? (
          <AuthNotice tone="error" icon={ShieldAlert} title="Could not sign you in">
            {errorMessage}
          </AuthNotice>
        ) : null}
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
          <Link href="/auth/forgot-password" className={authLinkClass}>
            Forgot password?
          </Link>
        </div>
        <AuthButton type="submit" loading={loginMutation.isPending}>
          Continue With Email
        </AuthButton>
      </div>

      <AuthDivider>Or continue with</AuthDivider>

      <div className="flex gap-3">
        <AuthOutlineButton onClick={() => comingSoon("Google")}>
          <GoogleIcon className="size-[18px]" />
          Google
        </AuthOutlineButton>
        <AuthOutlineButton onClick={() => comingSoon("GitHub")}>
          <GithubIcon className="size-[18px]" />
          GitHub
        </AuthOutlineButton>
      </div>

      <AuthFooterText>
        New to Veridom?{" "}
        <Link href="/auth/register" className={authLinkClass}>
          Create an account
        </Link>
      </AuthFooterText>
    </form>
  )
}
