"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import {
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react"

import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function VerifyEmailPanel({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Confirm your email address to activate your Veridom account.
          </p>
        </div>

        {token ? (
          <>
            {verifyMutation.isPending ? (
              <Alert>
                <Loader2 className="size-4 animate-spin" />
                <AlertTitle>Verifying your email</AlertTitle>
                <AlertDescription>
                  Hold on while we confirm your verification link.
                </AlertDescription>
              </Alert>
            ) : null}

            {verified ? (
              <Alert>
                <CheckCircle2 className="size-4" />
                <AlertTitle>Email verified</AlertTitle>
                <AlertDescription>
                  Your account is ready. You can sign in now.
                </AlertDescription>
              </Alert>
            ) : null}

            {verificationError ? (
              <Alert variant="destructive">
                <ShieldAlert className="size-4" />
                <AlertTitle>Verification failed</AlertTitle>
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            ) : null}
          </>
        ) : (
          <Alert>
            <Mail className="size-4" />
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              We&apos;ve sent an email with a verification link. If you didn&apos;t
              receive it, you can request another one below.
            </AlertDescription>
          </Alert>
        )}

        {verified ? (
          <Button asChild>
            <Link href="/auth/login">Continue to login</Link>
          </Button>
        ) : null}

        {!verified ? (
          <form className="space-y-4" onSubmit={handleResend}>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="bg-background"
              />
              <FieldDescription>
                We keep this response generic, even if the account is already
                verified.
              </FieldDescription>
            </Field>

            {resendMutation.isSuccess ? (
              <Alert>
                <RefreshCcw className="size-4" />
                <AlertTitle>Verification email sent</AlertTitle>
                <AlertDescription>
                  If your account is eligible, a fresh verification email is on
                  its way.
                </AlertDescription>
              </Alert>
            ) : null}

            {resendError ? (
              <Alert variant="destructive">
                <AlertTitle>Could not resend email</AlertTitle>
                <AlertDescription>{resendError}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={resendMutation.isPending}>
              {resendMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Resend verification email
            </Button>
          </form>
        ) : null}

        <FieldDescription className="text-center">
          Already verified?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </div>
  )
}
