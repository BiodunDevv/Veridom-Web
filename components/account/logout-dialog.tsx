"use client"

import * as React from "react"
import { Loader2, LogOut } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Illustration } from "@/components/ui/illustration"
import { useLogout } from "@/features/auth/hooks"

/**
 * Asks before signing out. Call `ask()` from any Log out button and render
 * `dialog` once next to it. The dialog stays open with a spinner while the
 * sign-out runs; the sign-out flow then takes the person away.
 */
export function useLogoutConfirm() {
  const [open, setOpen] = React.useState(false)
  const logout = useLogout()

  // Opened on the next tick so it never fights a dropdown or sheet that is
  // closing at the same moment (Radix would otherwise leave the page inert).
  const ask = React.useCallback(() => {
    window.setTimeout(() => setOpen(true), 0)
  }, [])

  const dialog = (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!logout.isPending) setOpen(next)
      }}
    >
      <AlertDialogContent className="gap-5 sm:max-w-sm">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="relative isolate mb-1 grid w-full place-items-center">
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 -z-10 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-2xl"
            />
            <Illustration name="logout" size="sm" className="h-24 sm:h-28" />
          </div>
          <AlertDialogTitle className="text-lg">
            Log out of Veridom?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance">
            You&apos;ll need to sign in again to see your deals, viewings and
            messages. Any payment Veridom is holding stays safe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-col-reverse sm:space-x-0">
          <AlertDialogCancel
            disabled={logout.isPending}
            className="mt-0 h-11 w-full"
          >
            Stay signed in
          </AlertDialogCancel>
          <Button
            variant="destructive"
            className="h-11 w-full"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, { onSuccess: () => setOpen(false) })
            }
          >
            {logout.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <LogOut aria-hidden />
            )}
            Log out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { ask, dialog, pending: logout.isPending }
}
