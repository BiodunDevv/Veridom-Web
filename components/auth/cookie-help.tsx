"use client"

import * as React from "react"
import { Cookie, LockKeyhole, RefreshCw, Settings2 } from "lucide-react"

import { AuthButton, AuthHeading } from "@/components/auth/auth-ui"
import { Button } from "@/components/ui/button"

const steps = [
  {
    icon: LockKeyhole,
    title: "Open site settings",
    text: "Click the icon at the left of the address bar, then choose Site settings.",
  },
  {
    icon: Cookie,
    title: "Allow cookies",
    text: "Set Cookies (or Third-party cookies) to Allow for this site.",
  },
  {
    icon: RefreshCw,
    title: "Try again",
    text: "Come back here and tap the button below.",
  },
]

/** Shown when login worked but the browser did not keep the session cookie. */
export function CookieHelp({
  onRetry,
  onBack,
}: {
  onRetry: () => Promise<void>
  onBack: () => void
}) {
  const [busy, setBusy] = React.useState(false)

  const retry = async () => {
    setBusy(true)
    try {
      await onRetry()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Cookie className="size-6" />
      </div>
      <AuthHeading
        title="Allow cookies to stay signed in"
        description="You are signed in, but your browser blocked the cookie that keeps you logged in."
      />
      <ol className="flex flex-col gap-2.5">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-xl border bg-muted/50 p-3 dark:bg-foreground/[0.04]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-primary shadow-xs">
              <Icon className="size-4" />
            </span>
            <span className="grid gap-0.5 text-sm">
              <span className="font-semibold">
                {i + 1}. {title}
              </span>
              <span className="text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2">
        <AuthButton type="button" loading={busy} onClick={retry}>
          I&apos;ve allowed cookies, try again
        </AuthButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-center text-muted-foreground"
          onClick={onBack}
        >
          <Settings2 /> Back to sign in
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        On Safari or Firefox, turn off &quot;Prevent cross-site tracking&quot;
        or Strict protection for this site.
      </p>
    </div>
  )
}
