"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck, Loader2 } from "lucide-react"

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
import { SlotPicker } from "@/components/listings/detail/slot-picker"
import { useInspectionAction } from "@/features/deals/hooks"
import { inspectionsApi } from "@/lib/api/deals"

export function ViewingDialog({
  listingId,
  title,
}: {
  listingId: string
  title: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [slot, setSlot] = React.useState<string | null>(null)

  const request = useInspectionAction(
    (startsAt: string) => inspectionsApi.request(listingId, startsAt),
    "Viewing requested. We'll tell you when the lister confirms.",
    () => {
      setOpen(false)
      router.push("/account/viewings")
    }
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSlot(null)
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full">
          <CalendarCheck /> Book a viewing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a viewing</DialogTitle>
          <DialogDescription>
            {title}. Times are in Lagos time. The exact address is shared once
            the lister confirms.
          </DialogDescription>
        </DialogHeader>

        <SlotPicker
          listingId={listingId}
          enabled={open}
          value={slot}
          onChange={setSlot}
        />

        <DialogFooter>
          <Button
            disabled={!slot || request.isPending}
            onClick={() => slot && request.mutate(slot)}
          >
            {request.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Request this time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
