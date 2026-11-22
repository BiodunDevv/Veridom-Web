"use client"

import * as React from "react"
import { ImagePlus, Loader2, SendHorizontal, X } from "lucide-react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/api/client"
import { inquiriesApi, type ChatSide } from "@/lib/api/inquiries"
import { putToStorage } from "@/lib/api/lister"
import { cn } from "@/lib/utils"

const MAX = 2000
const MAX_PHOTOS = 5
const MAX_BYTES = 5 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp"]

type Draft = {
  key: string
  preview: string
  status: "uploading" | "ready" | "error"
  id?: string
}

export type ReadyAttachment = { id: string; url: string; thumbUrl?: string }

export function Composer({
  side,
  threadId,
  disabled,
  onSend,
  onTyping,
}: {
  side: ChatSide
  threadId: string
  disabled?: boolean
  onSend: (body: string, attachments: ReadyAttachment[]) => Promise<boolean>
  onTyping: () => void
}) {
  const [text, setText] = React.useState("")
  const [drafts, setDrafts] = React.useState<Draft[]>([])
  const [sending, setSending] = React.useState(false)
  const area = React.useRef<HTMLTextAreaElement>(null)
  const files = React.useRef<HTMLInputElement>(null)
  const uploading = drafts.some((d) => d.status === "uploading")
  const ready = drafts.filter((d) => d.status === "ready")
  const canSend =
    !disabled &&
    !sending &&
    !uploading &&
    (text.trim().length > 0 || ready.length > 0) &&
    text.length <= MAX

  // Grow with the text, up to about five lines.
  React.useEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`
  }, [text])

  async function addFiles(list: FileList | null) {
    const picked = Array.from(list ?? [])
    for (const file of picked) {
      if (drafts.length + 1 > MAX_PHOTOS) {
        toast.error(`You can add up to ${MAX_PHOTOS} photos.`)
        break
      }
      if (!TYPES.includes(file.type)) {
        toast.error("Use a JPG, PNG or WebP photo.")
        continue
      }
      if (file.size > MAX_BYTES) {
        toast.error("Photos can be 5 MB at most.")
        continue
      }
      const key = crypto.randomUUID()
      const preview = URL.createObjectURL(file)
      setDrafts((d) => [...d, { key, preview, status: "uploading" }])
      try {
        const presign = await inquiriesApi.presign(side, threadId, {
          contentType: file.type,
          sizeBytes: file.size,
        })
        await putToStorage(
          {
            uploadUrl: presign.uploadUrl,
            method: presign.method,
            headers: presign.headers,
          },
          file
        )
        await inquiriesApi.confirm(side, threadId, presign.attachmentId)
        setDrafts((d) =>
          d.map((x) =>
            x.key === key
              ? { ...x, status: "ready", id: presign.attachmentId }
              : x
          )
        )
      } catch (error) {
        setDrafts((d) =>
          d.map((x) => (x.key === key ? { ...x, status: "error" } : x))
        )
        toast.error(getApiErrorMessage(error, "That photo couldn't be added."))
      }
    }
  }

  async function submit() {
    if (!canSend) return
    setSending(true)
    const body = text.trim()
    const attachments = ready.map((d) => ({
      id: d.id!,
      url: d.preview,
      thumbUrl: d.preview,
    }))
    setText("")
    setDrafts([])
    const ok = await onSend(body, attachments)
    setSending(false)
    if (!ok) setText(body)
    area.current?.focus()
  }

  return (
    <div className="border-t bg-background/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-4">
      {drafts.length ? (
        <ul className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {drafts.map((d) => (
            <li key={d.key} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.preview}
                alt=""
                className={cn(
                  "size-16 rounded-xl object-cover",
                  d.status !== "ready" && "opacity-50"
                )}
              />
              {d.status === "uploading" ? (
                <Loader2 className="absolute inset-0 m-auto size-5 animate-spin" />
              ) : null}
              {d.status === "error" ? (
                <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-destructive">
                  Failed
                </span>
              ) : null}
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() =>
                  setDrafts((all) => all.filter((x) => x.key !== d.key))
                }
                className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-end gap-2">
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          disabled={disabled || drafts.length >= MAX_PHOTOS}
          aria-label="Add photos"
          onClick={() => files.current?.click()}
        >
          <ImagePlus className="size-5" />
        </button>
        <input
          ref={files}
          type="file"
          accept={TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            void addFiles(e.target.files)
            e.target.value = ""
          }}
        />
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={area}
            value={text}
            rows={1}
            disabled={disabled}
            maxLength={MAX + 50}
            aria-label="Write a message"
            placeholder="Write a message"
            onChange={(e) => {
              setText(e.target.value)
              if (e.target.value) onTyping()
            }}
            onKeyDown={(e) => {
              const touch = window.matchMedia("(pointer: coarse)").matches
              if (e.key === "Enter" && !e.shiftKey && !touch) {
                e.preventDefault()
                void submit()
              }
            }}
            className="max-h-[132px] min-h-11 w-full resize-none rounded-3xl border border-input bg-card px-4 py-[10px] text-[15px] leading-snug outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          />
          {text.length > MAX - 300 ? (
            <span
              className={cn(
                "absolute right-3 bottom-1 text-[10px] tabular-nums",
                text.length > MAX ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {text.length}/{MAX}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-[background-color,opacity,transform] outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          disabled={!canSend}
          aria-label="Send"
          onClick={() => void submit()}
        >
          {sending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizontal className="size-5" />
          )}
        </button>
      </div>
    </div>
  )
}
