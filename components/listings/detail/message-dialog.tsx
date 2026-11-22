"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  MessageSquare,
  SendHorizontal,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

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
import { getApiErrorMessage } from "@/lib/api/client"
import { inquiriesApi } from "@/lib/api/inquiries"

const QUICK = [
  "Is this still available?",
  "Can I see it this weekend?",
  "Is the price negotiable?",
  "When can I move in?",
]
const MAX = 1000

/** Start a conversation with the lister, then open it. */
export function MessageDialog({
  listingId,
  title,
  listerName,
}: {
  listingId: string
  title: string
  listerName: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  // One id per attempt, so a double tap never starts two conversations.
  const clientId = React.useRef(crypto.randomUUID())

  async function submit() {
    const body = text.trim()
    if (!body || busy) return
    setBusy(true)
    try {
      const { inquiryId } = await inquiriesApi.start(
        listingId,
        body,
        clientId.current
      )
      setOpen(false)
      setText("")
      clientId.current = crypto.randomUUID()
      router.push(`/account/messages/${inquiryId}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't send your message."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full">
          <MessageSquare /> Message {listerName ? "the lister" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message {listerName || "the lister"}</DialogTitle>
          <DialogDescription>About: {title}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setText(q)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={MAX}
            placeholder="Write your message"
            aria-label="Your message"
            autoFocus
          />
          <p className="text-right text-[11px] text-muted-foreground tabular-nums">
            {text.length}/{MAX}
          </p>
        </div>
        <p className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0 text-primary"
            aria-hidden
          />
          Phone numbers and emails are hidden until a viewing is confirmed. Keep
          payments on Veridom.
        </p>
        <DialogFooter>
          <Button disabled={!text.trim() || busy} onClick={() => void submit()}>
            {busy ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
            Send message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
