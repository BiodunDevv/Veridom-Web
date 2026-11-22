"use client"

import * as React from "react"
import { FileText, Loader2, ShieldCheck, Trash2 } from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { Button } from "@/components/ui/button"
import {
  useDocuments,
  useRemoveDocument,
  useUploadDocument,
} from "@/features/lister/listing-hooks"

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp"

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
  const [label, setLabel] = React.useState("")

  return (
    <section
      className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6"
      aria-labelledby="docs-title"
    >
      <div>
        <h2 id="docs-title" className="text-lg font-semibold">
          Proof of ownership
        </h2>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          At least one document (title, authority letter…). Only the Veridom
          team can open them, they&apos;re virus-scanned, and they&apos;re
          deleted 90 days after review. You can&apos;t download them again.
        </p>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          minLength={2}
          maxLength={80}
          placeholder="What is it? e.g. Title document"
          aria-label="Document label"
          className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          asChild
          variant="outline"
          size="lg"
          aria-disabled={disabled || label.trim().length < 2}
        >
          <label
            className={
              disabled || label.trim().length < 2
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText />
            )}
            Choose file
            <input
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file)
                  upload.mutate(
                    { file, label: label.trim() },
                    { onSuccess: () => setLabel("") }
                  )
                e.target.value = ""
              }}
            />
          </label>
        </Button>
      </form>

      {docs.length === 0 ? (
        <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
          No documents yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{doc.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {doc.fileName}
                </p>
                {doc.status === "REJECTED" && doc.rejectReason ? (
                  <p className="text-xs text-destructive">{doc.rejectReason}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={doc.status} />
                {canDelete ? (
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Delete document"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(doc.id)}
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
