"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle2, Lock, ShieldAlert } from "lucide-react"

import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  AuthButton,
  AuthFooterText,
  AuthHeading,
  AuthInput,
  AuthNotice,
  authLinkClass,
} from "@/components/auth/auth-ui"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (error) => {
      setErrorMessage(
        getApiErrorMessage(error, "We could not reset your password."),
      )
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!token) {
      setErrorMessage("Reset token is missing from this link.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Use at least 8 characters for your new password.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    resetPasswordMutation.mutate({
      token,
      password,
    })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <AuthHeading
        title="Reset your password"
        description="Choose a new password for your account."
      />

      <div className="flex flex-col gap-3">
        {!token ? (
          <AuthNotice tone="error" icon={ShieldAlert} title="Reset link is incomplete">
            Open the full link from your email or request a new reset link.
          </AuthNotice>
        ) : null}
        {submitted ? (
          <AuthNotice icon={CheckCircle2} title="Password updated">
            Your password has been reset. You can sign in with the new one now.
          </AuthNotice>
        ) : null}
        {errorMessage ? (
          <AuthNotice tone="error" title="Reset failed">
            {errorMessage}
          </AuthNotice>
        ) : null}
        <AuthInput
          id="password"
          type="password"
          icon={Lock}
          label="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
        <AuthInput
          id="confirmPassword"
          type="password"
          icon={Lock}
          label="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />
        <AuthButton
          type="submit"
          loading={resetPasswordMutation.isPending}
          disabled={submitted}
        >
          Save new password
        </AuthButton>
      </div>

      <AuthFooterText>
        Need a fresh link?{" "}
        <Link href="/auth/forgot-password" className={authLinkClass}>
          Request another email
        </Link>
      </AuthFooterText>
    </form>
  )
}
