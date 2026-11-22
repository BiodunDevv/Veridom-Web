import { MessageSquareText } from "lucide-react"

/** The right-hand side of the inbox before a conversation is chosen (desktop only). */
export function EmptyThread() {
  return (
    <div className="hidden h-[calc(100svh-9rem)] min-h-[30rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/60 text-center lg:flex">
      <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <MessageSquareText className="size-6" aria-hidden />
      </span>
      <p className="text-lg font-semibold">Pick a conversation</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Choose one on the left to read it and reply.
      </p>
    </div>
  )
}
