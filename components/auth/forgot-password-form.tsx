"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { Loader2, MailCheck } from "lucide-react"

import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (error) => {
      setErrorMessage(
        getApiErrorMessage(error, "We could not submit your request."),
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

    forgotPasswordMutation.mutate({
      email: email.trim(),
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
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email address and we&apos;ll send reset instructions if your
            account is eligible.
          </p>
        </div>

        {submitted ? (
          <Alert>
            <MailCheck className="size-4" />
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              If an account exists for {email.trim()}, you&apos;ll receive a reset
              link shortly.
            </AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

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
            We keep the response generic to protect account privacy.
          </FieldDescription>
        </Field>

        <Field>
          <Button type="submit" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Send reset link
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remembered your password?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Back to login
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
