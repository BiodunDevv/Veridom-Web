"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { dealsApi } from "@/lib/api/deals"
import { getApiErrorMessage } from "@/lib/api/client"
import { formatNaira, lagosDate } from "@/lib/format"

/** The Idempotency-Key is made once per attempt and reused on retry, so a double tap never double-reserves. */
export function ReserveDialog({
  listingId,
  title,
  moveInTotalKobo,
}: {
  listingId: string
  title: string
  moveInTotalKobo?: number | null
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [moveInDate, setMoveInDate] = React.useState(lagosDate(7))
  const [ack, setAck] = React.useState(false)
  const keyRef = React.useRef<string | null>(null)

  const reserve = useMutation({
    mutationFn: () => {
      keyRef.current ??= crypto.randomUUID()
      return dealsApi.reserve(
        listingId,
        { moveInDate, acknowledgeNoInspection: ack || undefined },
        keyRef.current
      )
    },
    onSuccess: (deal) => {
      toast.success("Reserved. You have 30 minutes to pay.")
      setOpen(false)
      router.push(`/account/deals/${deal.id}`)
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Could not reserve this property.")
      ),
  })

  const change =
    <T,>(set: (v: T) => void) =>
    (value: T) => {
      keyRef.current = null
      set(value)
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Reserve now
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve this property</DialogTitle>
          <DialogDescription>
            {title}. We hold it for 30 minutes while you pay
            {moveInTotalKobo
              ? ` ${formatNaira(moveInTotalKobo)} move-in total`
              : ""}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-1 text-sm">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <label htmlFor="move-in-date" className="font-medium">
                Move-in date
              </label>
              <span className="text-xs text-muted-foreground">
                Pick a day within the next 30 days.
              </span>
            </div>
            <DatePicker
              id="move-in-date"
              value={moveInDate}
              onChange={change(setMoveInDate)}
              maxDays={30}
              className="gap-3"
              shortcuts={[
                { label: "In a week", days: 7 },
                { label: "In 2 weeks", days: 14 },
                { label: "In a month", days: 30 },
              ]}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
            <Checkbox
              checked={ack}
              onCheckedChange={(v) => change(setAck)(v === true)}
              className="mt-0.5"
            />
            <span className="leading-snug text-muted-foreground">
              I understand I&apos;m reserving without a completed viewing. Skip
              this if you&apos;ve already viewed the property.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            disabled={!moveInDate || reserve.isPending}
            onClick={() => reserve.mutate()}
          >
            {reserve.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Reserve and continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
