"use client"

import * as React from "react"
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Link2,
  Loader2,
  Maximize2,
  Star,
  Trash2,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { ListingImage } from "@/components/listings/listing-image"
import {
  PhotoLinkDialog,
  parseLinks,
} from "@/components/lister/photo-link-dialog"
import { PhotoViewer } from "@/components/lister/photo-viewer"
import { Button } from "@/components/ui/button"
import {
  useOrderPhotos,
  usePhotos,
  useRemovePhoto,
  useUploadPhoto,
} from "@/features/lister/listing-hooks"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX_BYTES = 10 * 1024 * 1024
const MAX_PHOTOS = 30

export function PhotosManager({
  listingId,
  disabled,
}: {
  listingId: string
  disabled?: boolean
}) {
  const photos = usePhotos(listingId).data ?? []
  const upload = useUploadPhoto(listingId)
  const order = useOrderPhotos(listingId)
  const remove = useRemovePhoto(listingId)
  const [busy, setBusy] = React.useState(0)
  const [viewing, setViewing] = React.useState<number | null>(null)
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [linkText, setLinkText] = React.useState("")
  const [dragging, setDragging] = React.useState(false)
  const remaining = Math.max(0, MAX_PHOTOS - photos.length)

  // Dropping files uploads them; dropping or pasting links opens the link importer.
  function onDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    if (event.dataTransfer.files.length) {
      void onFiles(event.dataTransfer.files)
      return
    }
    const text =
      event.dataTransfer.getData("text/uri-list") ||
      event.dataTransfer.getData("text/plain")
    if (parseLinks(text).links.length) {
      setLinkText(text)
      setLinkOpen(true)
    }
  }

  function onPaste(event: React.ClipboardEvent) {
    if (disabled) return
    const target = event.target as HTMLElement
    if (target.closest("input, textarea")) return
    const text = event.clipboardData.getData("text")
    if (parseLinks(text).links.length) {
      event.preventDefault()
      setLinkText(text)
      setLinkOpen(true)
    }
  }

  async function onFiles(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      if (file.size > MAX_BYTES) {
        upload.reset()
        continue
      }
      setBusy((n) => n + 1)
      await upload.mutateAsync(file).catch(() => undefined)
      setBusy((n) => n - 1)
    }
  }

  const move = (index: number, delta: number) => {
    const ids = photos.map((p) => p.id)
    const [item] = ids.splice(index, 1)
    ids.splice(index + delta, 0, item)
    order.mutate(ids)
  }

  return (
    <section
      className={`relative flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md transition-shadow sm:p-6 ${dragging ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
      aria-labelledby="photos-title"
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragging(false)
        }
      }}
      onDrop={onDrop}
      onPaste={onPaste}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="photos-title" className="text-lg font-semibold">
            Photos
          </h2>
          <p className="text-sm text-muted-foreground">
            At least 3, up to 30. JPEG, PNG or WebP, 10 MB each. The first photo
            is the cover. Location data is removed automatically. Drop files
            here, or paste image links.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={disabled || remaining === 0}
            onClick={() => {
              setLinkText("")
              setLinkOpen(true)
            }}
          >
            <Link2 />
            From link
          </Button>
          <Button asChild variant="outline" aria-disabled={disabled}>
            <label
              className={
                disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            >
              {busy > 0 ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus />
              )}
              Add photos
              <input
                type="file"
                accept={ACCEPT}
                multiple
                hidden
                disabled={disabled}
                onChange={(e) => {
                  void onFiles(e.target.files)
                  e.target.value = ""
                }}
              />
            </label>
          </Button>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/40 p-8 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <ImagePlus className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-medium">No photos yet</p>
          <p className="text-xs text-muted-foreground">
            Drag images here, choose files, or add them from a link.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2.5"
            >
              <button
                type="button"
                onClick={() => setViewing(index)}
                aria-label={`Open photo ${index + 1} full screen`}
                className="group/photo relative aspect-[3/2] cursor-zoom-in overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ListingImage
                  variants={photo.variants}
                  alt={`Photo ${index + 1}`}
                  sizes="(min-width: 1280px) 28vw, (min-width: 520px) 45vw, 92vw"
                  className="size-full transition-transform duration-500 group-hover/photo:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-[background-color,opacity] group-hover/photo:bg-black/35 group-hover/photo:opacity-100"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                    <Maximize2 className="size-3.5" /> View
                  </span>
                </span>
                {index === 0 ? (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    <Star className="size-3" /> Cover
                  </span>
                ) : null}
              </button>
              <div className="flex items-center justify-between gap-1">
                {photo.status === "READY" ? (
                  <span />
                ) : (
                  <StatusBadge status={photo.status} />
                )}
                <div className="ml-auto flex gap-1">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Move earlier"
                    disabled={disabled || index === 0 || order.isPending}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Move later"
                    disabled={
                      disabled || index === photos.length - 1 || order.isPending
                    }
                    onClick={() => move(index, 1)}
                  >
                    <ArrowRight />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Delete photo"
                    disabled={disabled || remove.isPending}
                    onClick={() => remove.mutate(photo.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              {photo.status === "REJECTED" && photo.rejectReason ? (
                <p className="text-xs text-destructive">{photo.rejectReason}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <PhotoViewer
        photos={photos}
        index={viewing}
        onIndexChange={setViewing}
        onClose={() => setViewing(null)}
        disabled={disabled}
        busy={remove.isPending || order.isPending}
        onMakeCover={(id) =>
          order.mutate([id, ...photos.map((p) => p.id).filter((x) => x !== id)])
        }
        onDelete={(id) =>
          remove.mutate(id, {
            onSuccess: () =>
              setViewing((i) =>
                photos.length <= 1 ? null : Math.min(i ?? 0, photos.length - 2)
              ),
          })
        }
      />
      <PhotoLinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        remaining={remaining}
        initialText={linkText}
        uploadFile={(file) => upload.mutateAsync(file)}
      />
    </section>
  )
}
