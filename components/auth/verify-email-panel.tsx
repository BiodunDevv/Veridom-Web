"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AtSign, CheckCircle2, Loader2, Mail, RefreshCcw, ShieldAlert } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

export function VerifyEmailPanel() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const initialEmail = searchParams.get("email") ?? ""
  const [email, setEmail] = React.useState(initialEmail)
  const [verificationError, setVerificationError] = React.useState<string | null>(
    null,
  )
  const [resendError, setResendError] = React.useState<string | null>(null)
  const [verified, setVerified] = React.useState(false)
  const attemptedRef = React.useRef(false)

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setVerified(true)
    },
    onError: (error) => {
      setVerificationError(
        getApiErrorMessage(error, "We could not verify this email."),
      )
    },
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      setResendError(null)
    },
    onError: (error) => {
      setResendError(
        getApiErrorMessage(error, "We could not resend the verification email."),
      )
    },
  })

  React.useEffect(() => {
    if (!token || attemptedRef.current) {
      return
    }

    attemptedRef.current = true
    verifyMutation.mutate({ token })
  }, [token, verifyMutation])

  const handleResend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResendError(null)

    if (!email.trim()) {
      setResendError("Email address is required.")
      return
    }

    resendMutation.mutate({
      email: email.trim(),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeading
        title="Verify your email"
        description="Confirm your email address to activate your account."
      />

      <div className="flex flex-col gap-3">
        {token ? (
          <>
            {verifyMutation.isPending ? (
              <AuthNotice icon={Loader2} title="Verifying your email">
                Hold on while we confirm your verification link.
              </AuthNotice>
            ) : null}
            {verified ? (
              <AuthNotice icon={CheckCircle2} title="Email verified">
                Your account is ready. You can sign in now.
              </AuthNotice>
            ) : null}
            {verificationError ? (
              <AuthNotice tone="error" icon={ShieldAlert} title="Verification failed">
                {verificationError}
              </AuthNotice>
            ) : null}
          </>
        ) : (
          <AuthNotice icon={Mail} title="Check your inbox">
            We&apos;ve sent a verification link. If you didn&apos;t receive it,
            request another one below.
          </AuthNotice>
        )}

        {verified ? (
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-xl text-[15px]")}
          >
            Continue to login
          </Link>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleResend} noValidate>
            <AuthInput
              id="email"
              type="email"
              icon={AtSign}
              label="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            {resendMutation.isSuccess ? (
              <AuthNotice icon={RefreshCcw} title="Verification email sent">
                If your account is eligible, a fresh email is on its way.
              </AuthNotice>
            ) : null}
            {resendError ? (
              <AuthNotice tone="error" title="Could not resend email">
                {resendError}
              </AuthNotice>
            ) : null}
            <AuthButton type="submit" loading={resendMutation.isPending}>
              Resend verification email
            </AuthButton>
          </form>
        )}
      </div>

      <AuthFooterText>
        Already verified?{" "}
        <Link href="/auth/login" className={authLinkClass}>
          Sign in
        </Link>
      </AuthFooterText>
    </div>
  )
}
