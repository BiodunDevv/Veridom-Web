"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { VerifyEmailForm } from "@/components/auth/verify-email-panel"
import type { AuthView, EmbeddedAuth } from "@/components/auth/auth-modal-types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type AuthModalContext = {
  open: (view?: AuthView, email?: string) => void
  close: () => void
}

const Context = React.createContext<AuthModalContext | null>(null)

export function useAuthModal() {
  const value = React.useContext(Context)
  if (!value)
    throw new Error("useAuthModal must be used inside AuthModalProvider")
  return value
}

/** Opens the modal from ?auth=login|register, then drops that param. */
function AuthQueryOpener({
  open,
}: {
  open: (view?: AuthView, email?: string) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const view = params.get("auth")

  React.useEffect(() => {
    if (view !== "login" && view !== "register") return
    open(view)
    const next = new URLSearchParams(params.toString())
    next.delete("auth")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [view, open, params, pathname, router])

  return null
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [view, setView] = React.useState<AuthView>("login")
  const [email, setEmail] = React.useState("")

  const open = React.useCallback((next: AuthView = "login", mail = "") => {
    setView(next)
    setEmail(mail)
    setIsOpen(true)
  }, [])
  const close = React.useCallback(() => setIsOpen(false), [])

  const embedded: EmbeddedAuth = React.useMemo(
    () => ({
      close,
      switchTo: (next, mail = "") => {
        setView(next)
        setEmail(mail)
      },
    }),
    [close]
  )

  const value = React.useMemo(() => ({ open, close }), [open, close])

  return (
    <Context.Provider value={value}>
      {children}
      <React.Suspense fallback={null}>
        <AuthQueryOpener open={open} />
      </React.Suspense>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-lenis-prevent
          className="max-h-[calc(100svh-1.5rem)] max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-2xl p-6 shadow-2xl sm:max-w-[26rem] sm:p-8"
        >
          <DialogTitle className="sr-only">
            {view === "register"
              ? "Create your account"
              : view === "verify"
                ? "Verify your email"
                : "Sign in"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Veridom account access
          </DialogDescription>
          {view === "login" && <LoginForm embedded={embedded} />}
          {view === "register" && <RegisterForm embedded={embedded} />}
          {view === "verify" && (
            <VerifyEmailForm
              key={email}
              initialEmail={email}
              embedded={embedded}
            />
          )}
        </DialogContent>
      </Dialog>
    </Context.Provider>
  )
}
