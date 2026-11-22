"use client"

import * as React from "react"
import {
  BadgeCheck,
  CircleAlert,
  EyeOff,
  FileImage,
  FileText,
  Loader2,
  ScanSearch,
  ShieldCheck,
  Timer,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"

import { useConfirm } from "@/components/lister/confirm-dialog"
import { StatusBadge } from "@/components/account/status-badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  useDocuments,
  useRemoveDocument,
  useUploadDocument,
} from "@/features/lister/listing-hooks"
import type { ProofDoc } from "@/lib/api/lister"
import { cn } from "@/lib/utils"

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp"
const ALLOWED = ACCEPT.split(",")

const KINDS = [
  "Title document",
  "Deed of assignment",
  "Survey plan",
  "Authority letter",
  "Government ID",
  "Utility bill",
]

const TRUST = [
  { icon: EyeOff, text: "Only the Veridom team can open them" },
  { icon: ScanSearch, text: "Virus-scanned on upload" },
  { icon: Timer, text: "Deleted 90 days after review" },
]

const isImage = (name: string) => /\.(png|jpe?g|webp)$/i.test(name)
const cleanName = (name: string) =>
  name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .slice(0, 80)

function DocStatus({ doc }: { doc: ProofDoc }) {
  if (doc.status === "SCANNING" || doc.status === "PENDING_UPLOAD")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <Loader2 className="size-3 animate-spin" aria-hidden />
        {doc.status === "SCANNING" ? "Scanning" : "Uploading"}
      </span>
    )
  if (doc.status === "READY")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        <BadgeCheck className="size-3.5" aria-hidden /> Ready
      </span>
    )
  return <StatusBadge status={doc.status} />
}

export function DocumentsManager({
  listingId,
  disabled,
  canDelete,
}: {
  listingId: string
  disabled?: boolean
  canDelete?: boolean
}) {
  const docs = useDocuments(listingId).data ?? []
  const upload = useUploadDocument(listingId)
  const remove = useRemoveDocument(listingId)
  const confirm = useConfirm()
  const [label, setLabel] = React.useState("")
  const [dragging, setDragging] = React.useState(false)
  const [uploading, setUploading] = React.useState<string | null>(null)
  const fileInput = React.useRef<HTMLInputElement>(null)
  const done = docs.some((d) => d.status !== "REJECTED")

  async function send(file: File | undefined) {
    if (!file || disabled) return
    if (!ALLOWED.includes(file.type)) {
      toast.error("Use a PDF, JPG, PNG or WebP file.")
      return
    }
    const name = label.trim().length >= 2 ? label.trim() : cleanName(file.name)
    setUploading(file.name)
    await upload
      .mutateAsync({ file, label: name.length >= 2 ? name : "Document" })
      .then(() => setLabel(""))
      .catch(() => undefined)
    setUploading(null)
  }

  return (
    <section
      className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-md sm:p-6"
      aria-labelledby="docs-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="docs-title" className="text-lg font-semibold">
              Proof of ownership
            </h2>
            <p className="text-sm text-muted-foreground">
              Add at least one document: a title, deed or authority letter.
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            done
              ? "bg-primary/10 text-primary"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          )}
        >
          {done ? (
            <BadgeCheck className="size-3.5" aria-hidden />
          ) : (
            <CircleAlert className="size-3.5" aria-hidden />
          )}
          {done ? "Provided" : "Required"}
        </span>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        {TRUST.map(({ icon: Icon, text }) => (
          <li key={text} className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5 text-primary" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      {!disabled ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="doc-label" className="text-sm font-semibold">
              What is it?
            </label>
            <InputGroup className="h-11 rounded-xl bg-background">
              <InputGroupAddon align="inline-start" className="pl-3.5">
                <FileText className="size-[18px] text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="doc-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={80}
                placeholder="e.g. Title document"
                autoComplete="off"
                className="h-full text-base md:text-base"
              />
            </InputGroup>
            <div className="flex flex-wrap gap-1.5" aria-label="Suggestions">
              {KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setLabel(kind)}
                  aria-pressed={label === kind}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    label === kind
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a document"
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                fileInput.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              void send(e.dataTransfer.files[0])
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              dragging
                ? "border-primary bg-primary/10"
                : "bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
              {upload.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <UploadCloud className="size-5" aria-hidden />
              )}
            </span>
            <p className="text-sm font-semibold">
              {upload.isPending
                ? "Uploading…"
                : dragging
                  ? "Drop it here"
                  : "Drop a file here, or tap to choose"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG or WebP. Leave the name blank and we&apos;ll use the
              file name.
            </p>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                void send(e.target.files?.[0])
                e.target.value = ""
              }}
            />
          </div>
        </div>
      ) : null}

      {docs.length === 0 && !uploading ? (
        <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
          No documents yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {uploading ? (
            <li className="flex animate-pulse items-center gap-3 rounded-xl border bg-muted/30 p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Loader2 className="size-4 animate-spin" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{uploading}</p>
                <p className="text-xs text-muted-foreground">Uploading…</p>
              </div>
            </li>
          ) : null}
          {docs.map((doc) => {
            const Icon = isImage(doc.fileName) ? FileImage : FileText
            const rejected = doc.status === "REJECTED"
            return (
              <li
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5",
                  rejected
                    ? "border-destructive/30 bg-destructive/5"
                    : "bg-background/60"
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg ring-1",
                    rejected
                      ? "bg-destructive/10 text-destructive ring-destructive/20"
                      : "bg-primary/10 text-primary ring-primary/15"
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {doc.fileName}
                  </p>
                  {rejected && doc.rejectReason ? (
                    <p className="mt-1 flex items-start gap-1 text-xs text-destructive">
                      <CircleAlert
                        className="mt-0.5 size-3 shrink-0"
                        aria-hidden
                      />
                      {doc.rejectReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <DocStatus doc={doc} />
                  {canDelete ? (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${doc.label}`}
                      disabled={remove.isPending}
                      onClick={() =>
                        confirm.ask({
                          title: "Delete this document?",
                          description: `"${doc.label}" will be removed. Documents can't be downloaded again, so you'd need to upload it afresh.`,
                          confirmLabel: "Delete document",
                          tone: "danger",
                          run: () => remove.mutateAsync(doc.id),
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {confirm.dialog}
    </section>
  )
}
