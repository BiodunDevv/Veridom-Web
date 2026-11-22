"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

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

export type ConfirmRequest = {
  title: string
  description: React.ReactNode
  confirmLabel: string
  /** Destructive actions get a red button and a warning icon. */
  tone?: "danger" | "default"
  /** Resolve when done; the dialog stays open and shows a spinner meanwhile. */
  run: () => Promise<unknown> | void
}

/**
 * One shared confirmation for risky actions. Call `ask(...)` and render `dialog`.
 */
export function useConfirm() {
  const [request, setRequest] = React.useState<ConfirmRequest | null>(null)
  const [busy, setBusy] = React.useState(false)

  const dialog = (
    <AlertDialog
      open={Boolean(request)}
      onOpenChange={(open) => {
        if (!open && !busy) setRequest(null)
      }}
    >
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <span
            className={
              request?.tone === "danger"
                ? "mb-1 grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive"
                : "mb-1 grid size-11 place-items-center rounded-full bg-primary/10 text-primary"
            }
          >
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {request?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button
            variant={request?.tone === "danger" ? "destructive" : "default"}
            disabled={busy}
            onClick={async () => {
              if (!request) return
              setBusy(true)
              try {
                await request.run()
                setRequest(null)
              } catch {
                // The action reports its own error; keep the dialog open to retry.
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? <Loader2 className="animate-spin" /> : null}
            {request?.confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { ask: setRequest, dialog }
}
