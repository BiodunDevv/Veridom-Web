"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react"

import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
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
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Choose a new password for your Veridom account.
          </p>
        </div>

        {!token ? (
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>Reset link is incomplete</AlertTitle>
            <AlertDescription>
              Open the full link from your email or request a new reset link.
            </AlertDescription>
          </Alert>
        ) : null}

        {submitted ? (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertTitle>Password updated</AlertTitle>
            <AlertDescription>
              Your password has been reset successfully. You can sign in with
              the new one now.
            </AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Reset failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="bg-background"
          />
          <FieldDescription>
            Resetting your password will revoke any other active sessions.
          </FieldDescription>
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending || submitted}
          >
            {resetPasswordMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Save new password
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Need a fresh reset link?{" "}
          <Link href="/auth/forgot-password" className="underline underline-offset-4">
            Request another email
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
