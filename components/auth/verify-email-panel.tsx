"use client"

import * as React from "react"
import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AtSign, CheckCircle2, Mail } from "lucide-react"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage, isApiError } from "@/lib/api/client"
import type { EmbeddedAuth } from "@/components/auth/auth-modal-types"
import {
  AuthButton,
  AuthFooterText,
  AuthHeading,
  AuthInput,
  AuthNotice,
  authLinkClass,
} from "@/components/auth/auth-ui"
import { buttonVariants } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

/** Friendly copy for the codes the API documents. */
function describeError(error: unknown, fallback: string) {
  if (isApiError(error)) {
    if (error.status === 429)
      return "Too many attempts. Please wait a little and try again."
    if (error.code === "INVALID_CODE") {
      return "That code is wrong or has expired. Check the latest email, or request a new code."
    }
  }
  return getApiErrorMessage(error, fallback)
}

export function VerifyEmailPanel() {
  const searchParams = useSearchParams()
  return <VerifyEmailForm initialEmail={searchParams.get("email") ?? ""} />
}

export function VerifyEmailForm({
  initialEmail = "",
  embedded,
}: {
  initialEmail?: string
  embedded?: EmbeddedAuth
}) {
  const [email, setEmail] = React.useState(initialEmail)
  const [code, setCode] = React.useState("")
  const [verified, setVerified] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000
    )
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => setVerified(true),
    onError: (error) => {
      toast.error(describeError(error, "We could not verify this code."))
      setCode("")
    },
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      setCooldown(RESEND_COOLDOWN_SECONDS)
      toast.success("A new code is on its way.")
    },
    onError: (error) =>
      toast.error(describeError(error, "We could not send a new code.")),
  })

  const submit = (value: string) => {
    if (!email.trim()) {
      toast.error("Enter the email address you signed up with.")
      return
    }
    verifyMutation.mutate({ email: email.trim(), code: value })
  }

  const handleResend = () => {
    if (!email.trim()) {
      toast.error("Email address is required.")
      return
    }
    resendMutation.mutate({ email: email.trim() })
  }

  if (verified) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeading
          title="Email verified"
          description="Your account is ready to use."
        />
        <AuthNotice icon={CheckCircle2} title="You're all set">
          You can sign in and start exploring Veridom.
        </AuthNotice>
        {embedded ? (
          <AuthButton type="button" onClick={() => embedded.switchTo("login")}>
            Continue to login
          </AuthButton>
        ) : (
          <Link
            href="/?auth=login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full rounded-xl text-[15px]"
            )}
          >
            Continue to login
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeading
        title="Enter your code"
        description="We emailed a 6-digit code. It works for 10 minutes."
      />

      <div className="flex flex-col gap-4">
        {!initialEmail ? (
          <AuthInput
            id="email"
            type="email"
            icon={AtSign}
            label="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        ) : (
          <AuthNotice icon={Mail} title="Check your inbox">
            Code sent to {email}.
          </AuthNotice>
        )}

        <div className="flex justify-center">
          <InputOTP
            maxLength={CODE_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={submit}
            disabled={verifyMutation.isPending}
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            aria-label="6-digit verification code"
          >
            <InputOTPGroup>
              {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="size-11 text-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <AuthButton
          type="button"
          loading={verifyMutation.isPending}
          disabled={code.length !== CODE_LENGTH}
          onClick={() => submit(code)}
        >
          Verify email
        </AuthButton>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendMutation.isPending}
          className={cn(
            authLinkClass,
            "mx-auto disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          )}
        >
          {cooldown > 0
            ? `Send a new code in ${cooldown}s`
            : "Didn't get it? Send a new code"}
        </button>
      </div>

      <AuthFooterText>
        Already verified?{" "}
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
    </div>
  )
}
