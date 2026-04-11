"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Loader2, UserRoundPlus } from "lucide-react"
import { toast } from "sonner"

import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type RegisterValues = {
  role: "TENANT" | "LANDLORD"
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const initialValues: RegisterValues = {
  role: "TENANT",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [values, setValues] = React.useState(initialValues)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created. Check your email to verify your address.")
      router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
    },
    onError: (error) => {
      setErrorMessage(
        getApiErrorMessage(error, "We could not create your account."),
      )
    },
  })

  const updateValue = (field: keyof RegisterValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!values.firstName.trim() || !values.lastName.trim()) {
      setErrorMessage("Enter your first and last name.")
      return
    }

    if (!values.email.trim()) {
      setErrorMessage("Email address is required.")
      return
    }

    if (values.password.length < 8) {
      setErrorMessage("Use at least 8 characters for your password.")
      return
    }

    if (values.password !== values.confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    registerMutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      password: values.password,
      role: values.role,
    })
  }

  const isPending = registerMutation.isPending

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Join Veridom as a tenant or landlord with the same secure account flow.
          </p>
        </div>

        {errorMessage ? (
          <Alert variant="destructive">
            <UserRoundPlus className="size-4" />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <Field>
          <FieldLabel htmlFor="role">Account type</FieldLabel>
          <Select value={values.role} onValueChange={(value) => updateValue("role", value)}>
            <SelectTrigger id="role" className="h-10 w-full bg-background">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TENANT">Tenant</SelectItem>
              <SelectItem value="LANDLORD">Landlord</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Landlords and tenants use the same verified account system.
          </FieldDescription>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(event) => updateValue("firstName", event.target.value)}
              autoComplete="given-name"
              className="bg-background"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(event) => updateValue("lastName", event.target.value)}
              autoComplete="family-name"
              className="bg-background"
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Phone number</FieldLabel>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            autoComplete="tel"
            placeholder="+2348012345678"
            className="bg-background"
          />
          <FieldDescription>Optional, but useful for account recovery later.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={values.password}
            onChange={(event) => updateValue("password", event.target.value)}
            autoComplete="new-password"
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(event) =>
              updateValue("confirmPassword", event.target.value)
            }
            autoComplete="new-password"
            className="bg-background"
          />
        </Field>

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Create account
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
