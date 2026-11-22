"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AtSign, Lock, Phone, UserRound } from "lucide-react"
import { toast } from "sonner"

import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { takeApiMessage } from "@/lib/api/last-message"
import type { EmbeddedAuth } from "@/components/auth/auth-modal-types"
import {
  AuthButton,
  AuthDivider,
  AuthFooterText,
  AuthHeading,
  AuthInput,
  AuthOutlineButton,
  GoogleIcon,
  authLinkClass,
} from "@/components/auth/auth-ui"
type RegisterValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const initialValues: RegisterValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

export function RegisterForm({ embedded }: { embedded?: EmbeddedAuth }) {
  const router = useRouter()
  const [values, setValues] = React.useState(initialValues)

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created", {
        description:
          takeApiMessage("Account created") ??
          "Enter the 6-digit code we emailed you.",
      })
      if (embedded) {
        embedded.switchTo("verify", values.email.trim())
        return
      }
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(values.email)}`
      )
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "We could not create your account.")
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

    if (!values.firstName.trim() || !values.lastName.trim()) {
      toast.error("Enter your first and last name.")
      return
    }

    if (!values.email.trim()) {
      toast.error("Email address is required.")
      return
    }

    if (values.password.length < 8) {
      toast.error("Use at least 8 characters for your password.")
      return
    }

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    registerMutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      password: values.password,
    })
  }

  const isPending = registerMutation.isPending

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <AuthHeading
        title="Create your account"
        description="Join Veridom to browse, book viewings and rent with confidence."
      />

      <div className="flex flex-col gap-3">
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
          onChange={(event) =>
            updateValue("confirmPassword", event.target.value)
          }
          autoComplete="new-password"
        />
        <AuthButton type="submit" loading={isPending}>
          Create account
        </AuthButton>
        <p className="text-center text-xs leading-relaxed text-foreground/55">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className={authLinkClass}
            onClick={embedded?.close}
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className={authLinkClass}
            onClick={embedded?.close}
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <AuthDivider>Or continue with</AuthDivider>

      <AuthOutlineButton
        className="w-full flex-none"
        onClick={() => toast.info("Google sign-in isn't available yet.")}
      >
        <GoogleIcon className="size-[18px]" />
        Continue with Google
      </AuthOutlineButton>

      <AuthFooterText>
        Already have an account?{" "}
        {embedded ? (
          <button
            type="button"
            className={authLinkClass}
            onClick={() => embedded.switchTo("login")}
          >
            Sign in
          </button>
        ) : (
          <Link href="/?auth=login" className={authLinkClass}>
            Sign in
          </Link>
        )}
      </AuthFooterText>
    </form>
  )
}
