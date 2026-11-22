"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Circle, Link2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type Step = "queued" | "fetching" | "uploading" | "done" | "error"
type Item = { url: string; step: Step; message?: string }

/** Download a public image link through our server, as a File ready to upload. */
export async function fileFromUrl(url: string): Promise<File> {
  const res = await fetch("/api/media/import", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(data?.error ?? "We couldn't open that link.")
  }
  const blob = await res.blob()
  const ext =
    blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1]
  let base = "photo"
  try {
    base =
      decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "")
        .replace(/\.[a-z0-9]+$/i, "")
        .slice(0, 60) || "photo"
  } catch {
    // keep the default
  }
  return new File([blob], `${base}.${ext}`, { type: blob.type })
}

/** Pull valid, unique http(s) links out of pasted text. */
export function parseLinks(text: string): { links: string[]; invalid: number } {
  const seen = new Set<string>()
  let invalid = 0
  for (const part of text.split(/[\s,]+/).filter(Boolean)) {
    try {
      const u = new URL(part)
      if (u.protocol === "http:" || u.protocol === "https:") seen.add(u.href)
      else invalid++
    } catch {
      invalid++
    }
  }
  return { links: [...seen], invalid }
}

function LinkImporter({
  onOpenChange,
  onBusy,
  remaining,
  uploadFile,
  initialText,
}: {
  onOpenChange: (open: boolean) => void
  onBusy: (busy: boolean) => void
  remaining: number
  uploadFile: (file: File) => Promise<unknown>
  initialText: string
}) {
  const [text, setText] = React.useState(initialText)
  const [items, setItems] = React.useState<Item[]>([])
  const [running, setRunning] = React.useState(false)

  const parsed = React.useMemo(() => parseLinks(text), [text])
  const over = Math.max(0, parsed.links.length - remaining)
  const queue = parsed.links.slice(0, remaining)

  const patch = (url: string, next: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.url === url ? { ...i, ...next } : i)))

  async function run() {
    if (!queue.length) return
    setRunning(true)
    onBusy(true)
    setItems(queue.map((url) => ({ url, step: "queued" })))
    let ok = 0
    for (const url of queue) {
      try {
        patch(url, { step: "fetching" })
        const file = await fileFromUrl(url)
        patch(url, { step: "uploading" })
        await uploadFile(file)
        patch(url, { step: "done" })
        ok++
      } catch (error) {
        patch(url, {
          step: "error",
          message:
            error instanceof Error ? error.message : "That photo failed.",
        })
      }
    }
    setRunning(false)
    onBusy(false)
    if (ok === queue.length) {
      toast.success(ok === 1 ? "Photo added" : `${ok} photos added`)
      onOpenChange(false)
    } else if (ok > 0) {
      toast.warning(`${ok} of ${queue.length} photos added`, {
        description: "Fix the links marked in red and try again.",
      })
    }
  }

  const showList = items.length > 0
  const failed = items.filter((i) => i.step === "error")

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="size-4" aria-hidden />
          </span>
          Add photos from links
        </DialogTitle>
        <DialogDescription>
          Paste direct links to JPEG, PNG or WebP images, one per line. We fetch
          them securely and add them to the listing.
        </DialogDescription>
      </DialogHeader>

      {showList ? (
        <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.url}
              className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="mt-0.5 shrink-0">
                {item.step === "done" ? (
                  <CheckCircle2 className="size-4 text-primary" />
                ) : item.step === "error" ? (
                  <AlertCircle className="size-4 text-destructive" />
                ) : item.step === "queued" ? (
                  <Circle className="size-4 text-muted-foreground/50" />
                ) : (
                  <Loader2 className="size-4 animate-spin text-primary" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.url}</span>
                <span
                  className={
                    item.step === "error"
                      ? "block text-xs text-destructive"
                      : "block text-xs text-muted-foreground"
                  }
                >
                  {item.step === "queued" && "Waiting"}
                  {item.step === "fetching" && "Fetching image…"}
                  {item.step === "uploading" && "Uploading…"}
                  {item.step === "done" && "Added"}
                  {item.step === "error" && item.message}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            autoFocus
            spellCheck={false}
            aria-label="Image links"
            placeholder={
              "https://example.com/living-room.jpg\nhttps://example.com/kitchen.webp"
            }
            className="[field-sizing:fixed] max-h-48 min-h-28 w-full min-w-0 resize-y font-mono text-xs break-all"
          />
          <p
            className="min-h-4 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {parsed.links.length
              ? `${Math.min(parsed.links.length, remaining)} photo${Math.min(parsed.links.length, remaining) === 1 ? "" : "s"} ready to add`
              : `You can add ${remaining} more photo${remaining === 1 ? "" : "s"}.`}
            {parsed.invalid
              ? ` ${parsed.invalid} entr${parsed.invalid === 1 ? "y isn't" : "ies aren't"} a valid link and will be skipped.`
              : ""}
            {over ? ` ${over} over the 30 photo limit will be skipped.` : ""}
          </p>
        </div>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          disabled={running}
          onClick={() => onOpenChange(false)}
        >
          {showList && !running ? "Close" : "Cancel"}
        </Button>
        {showList && !running && failed.length ? (
          <Button
            onClick={() => {
              setText(failed.map((f) => f.url).join("\n"))
              setItems([])
            }}
          >
            Edit failed links
          </Button>
        ) : (
          <Button
            disabled={running || !queue.length || remaining <= 0}
            onClick={() => void run()}
          >
            {running ? <Loader2 className="animate-spin" /> : <Link2 />}
            {running
              ? "Adding…"
              : `Add ${queue.length || ""} photo${queue.length === 1 ? "" : "s"}`.replace(
                  "  ",
                  " "
                )}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

export function PhotoLinkDialog({
  open,
  onOpenChange,
  remaining,
  uploadFile,
  initialText = "",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** How many more photos this listing can take. */
  remaining: number
  uploadFile: (file: File) => Promise<unknown>
  initialText?: string
}) {
  const [busy, setBusy] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={(v) => (!busy ? onOpenChange(v) : null)}>
      <DialogContent className="min-w-0 overflow-hidden sm:max-w-lg">
        {/* Mounted only while open, so every visit starts fresh. */}
        <LinkImporter
          onOpenChange={onOpenChange}
          onBusy={setBusy}
          remaining={remaining}
          uploadFile={uploadFile}
          initialText={initialText}
        />
      </DialogContent>
    </Dialog>
  )
}
