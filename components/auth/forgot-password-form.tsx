"use client"

import * as React from "react"
import { toast } from "sonner"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { AtSign, MailCheck } from "lucide-react"

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

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => setSubmitted(true),
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "We could not submit your request.")
      )
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Email address is required.")
      return
    }

    forgotPasswordMutation.mutate({ email: email.trim() })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <AuthHeading
        title="Forgot your password?"
        description="Enter your email and we'll send reset instructions if your account is eligible."
      />

      <div className="flex flex-col gap-3">
        {submitted ? (
          <AuthNotice icon={MailCheck} title="Check your inbox">
            If an account exists for {email.trim()}, you&apos;ll receive a reset
            link shortly.
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
        <AuthButton type="submit" loading={forgotPasswordMutation.isPending}>
          Send reset link
        </AuthButton>
      </div>

      <AuthFooterText>
        Remembered your password?{" "}
        <Link href="/?auth=login" className={authLinkClass}>
          Back to login
        </Link>
      </AuthFooterText>
    </form>
  )
}
