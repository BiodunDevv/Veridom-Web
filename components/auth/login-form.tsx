"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, LogIn } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
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
        router.push(redirectPath ?? "/")
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
      const message = getApiErrorMessage(error, "Login failed.")
      setErrorMessage(message)
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

    loginMutation.mutate({
      email: email.trim(),
      password,
    })
  }

  const isPending = loginMutation.isPending

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to access your Veridom account.
          </p>
        </div>
        {errorMessage ? (
          <Alert variant="destructive">
            <LogIn className="size-4" />
            <AlertTitle>Could not sign you in</AlertTitle>
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
            placeholder="you@example.com"
            className="bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="bg-background"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Login
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
