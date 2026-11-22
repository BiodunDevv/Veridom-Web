"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

/** A button that opens a dialog asking for a reason before it fires. */
export function ReasonDialog({
  trigger,
  title,
  description,
  confirmLabel,
  variant = "default",
  minLength = 5,
  pending,
  onConfirm,
}: {
  trigger: string
  title: string
  description: string
  confirmLabel: string
  variant?: "default" | "destructive"
  minLength?: number
  pending: boolean
  onConfirm: (reason: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Tell us what happened"
          aria-label="Reason"
        />
        <DialogFooter>
          <Button
            variant={variant}
            disabled={reason.trim().length < minLength || pending}
            onClick={() => {
              onConfirm(reason.trim())
              setOpen(false)
              setReason("")
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
