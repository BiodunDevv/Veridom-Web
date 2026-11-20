"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AtSign, Lock, Phone, UserRound, UserRoundPlus } from "lucide-react"
import { toast } from "sonner"

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
import { cn } from "@/lib/utils"

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

export function RegisterForm() {
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
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <AuthHeading
        title="Create your account"
        description="Join Veridom as a tenant or landlord."
      />

      <div className="flex flex-col gap-3">
        {errorMessage ? (
          <AuthNotice tone="error" icon={UserRoundPlus} title="Registration failed">
            {errorMessage}
          </AuthNotice>
        ) : null}

        <div
          role="radiogroup"
          aria-label="Account type"
          className="grid grid-cols-2 gap-1 rounded-xl border border-input bg-muted/60 p-1"
        >
          {(["TENANT", "LANDLORD"] as const).map((role) => (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={values.role === role}
              onClick={() => updateValue("role", role)}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-foreground/20",
                values.role === role
                  ? "bg-card text-foreground shadow-sm"
                  : "text-foreground/55 hover:text-foreground",
              )}
            >
              {role === "TENANT" ? "Tenant" : "Landlord"}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AuthInput
            id="firstName"
            icon={UserRound}
            label="First name"
            value={values.firstName}
            onChange={(event) => updateValue("firstName", event.target.value)}
            autoComplete="given-name"
          />
          <AuthInput
            id="lastName"
            icon={UserRound}
            label="Last name"
            value={values.lastName}
            onChange={(event) => updateValue("lastName", event.target.value)}
            autoComplete="family-name"
          />
        </div>
        <AuthInput
          id="email"
          type="email"
          icon={AtSign}
          label="Enter your email address"
          value={values.email}
          onChange={(event) => updateValue("email", event.target.value)}
          autoComplete="email"
        />
        <AuthInput
          id="phone"
          type="tel"
          icon={Phone}
          label="Phone number (optional)"
          value={values.phone}
          onChange={(event) => updateValue("phone", event.target.value)}
          autoComplete="tel"
        />
        <AuthInput
          id="password"
          type="password"
          icon={Lock}
          label="Create a password"
          value={values.password}
          onChange={(event) => updateValue("password", event.target.value)}
          autoComplete="new-password"
        />
        <AuthInput
          id="confirmPassword"
          type="password"
          icon={Lock}
          label="Confirm password"
          value={values.confirmPassword}
          onChange={(event) => updateValue("confirmPassword", event.target.value)}
          autoComplete="new-password"
        />
        <AuthButton type="submit" loading={isPending}>
          Create account
        </AuthButton>
      </div>

      <AuthFooterText>
        Already have an account?{" "}
        <Link href="/auth/login" className={authLinkClass}>
          Sign in
        </Link>
      </AuthFooterText>
    </form>
  )
}
