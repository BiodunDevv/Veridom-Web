"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Camera,
  ImagePlus,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { PhotoLightbox } from "@/components/ui/photo-lightbox"
import { getApiErrorMessage } from "@/lib/api/client"
import { inspectionsApi } from "@/lib/api/deals"
import { putToStorage } from "@/lib/api/lister"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"

const MAX = 5
const MAX_BYTES = 5 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp"]
/** Photos can only be added once the viewing is confirmed. */
const OPEN_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]

type Pending = {
  key: string
  file: File
  preview: string
  status: "uploading" | "error"
  error?: string
}

const tile =
  "relative aspect-[4/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border"

/**
 * Private proof photos from a viewing: up to 5, 5 MB each. Drop or pick photos,
 * watch each one upload, retry any that fail, and tap a photo to see it large.
 * Only you and the Veridom team can see them.
 */
export function EvidencePhotos({
  inspectionId,
  status,
}: {
  inspectionId: string
  /** The viewing's status; photos are locked until it is confirmed. */
  status?: string
}) {
  const queryClient = useQueryClient()
  const photos = useQuery({
    queryKey: queryKeys.inspectionPhotos(inspectionId),
    queryFn: () => inspectionsApi.photos(inspectionId),
    retry: false,
  })
  const [pending, setPending] = React.useState<Pending[]>([])
  const [dragging, setDragging] = React.useState(false)
  const [viewing, setViewing] = React.useState<number | null>(null)
  const input = React.useRef<HTMLInputElement>(null)

  const saved = React.useMemo(
    () => (photos.data ?? []).filter((p) => p.url),
    [photos.data]
  )
  const total = (photos.data?.length ?? 0) + pending.length
  const full = total >= MAX
  const locked = status ? !OPEN_STATUSES.includes(status) : false
  const disabled = full || locked

  const send = React.useCallback(
    async (item: Pending) => {
      setPending((all) =>
        all.map((p) =>
          p.key === item.key
            ? { ...p, status: "uploading", error: undefined }
            : p
        )
      )
      try {
        const presign = await inspectionsApi.presignPhoto(inspectionId, {
          contentType: item.file.type,
          sizeBytes: item.file.size,
        })
        await putToStorage(presign, item.file)
        await inspectionsApi.confirmPhoto(inspectionId, presign.photoId)
        await queryClient.invalidateQueries({
          queryKey: queryKeys.inspectionPhotos(inspectionId),
        })
        URL.revokeObjectURL(item.preview)
        setPending((all) => all.filter((p) => p.key !== item.key))
      } catch (error) {
        setPending((all) =>
          all.map((p) =>
            p.key === item.key
              ? {
                  ...p,
                  status: "error",
                  error: getApiErrorMessage(error, "Upload failed."),
                }
              : p
          )
        )
      }
    },
    [inspectionId, queryClient]
  )

  const add = (list: FileList | File[] | null) => {
    if (!list || disabled) return
    let room = MAX - total
    const fresh: Pending[] = []
    for (const file of Array.from(list)) {
      if (!TYPES.includes(file.type)) {
        toast.error(`${file.name}: use a JPG, PNG or WebP photo.`)
        continue
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is over 5 MB.`)
        continue
      }
      if (room <= 0) {
        toast.error(`You can add up to ${MAX} photos.`)
        break
      }
      room -= 1
      fresh.push({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "uploading",
      })
    }
    if (!fresh.length) return
    setPending((all) => [...all, ...fresh])
    // One at a time keeps the server happy and the progress easy to follow.
    void (async () => {
      for (const item of fresh) await send(item)
    })()
  }

  const dismiss = (item: Pending) => {
    URL.revokeObjectURL(item.preview)
    setPending((all) => all.filter((p) => p.key !== item.key))
  }

  const empty = !photos.isPending && total === 0

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Camera className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg leading-tight font-semibold">
              Photos from the viewing
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
              Private. They help if there&apos;s ever a dispute.
            </p>
          </div>
        </div>
        <div
          className="flex flex-col items-end gap-1.5"
          aria-label={`${total} of ${MAX} photos`}
        >
          <span className="text-sm font-semibold tabular-nums">
            {total}
            <span className="font-normal text-muted-foreground"> / {MAX}</span>
          </span>
          <span className="flex gap-1" aria-hidden>
            {Array.from({ length: MAX }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-5 rounded-full transition-colors duration-500",
                  i < total ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </span>
        </div>
      </div>

      {/* Dropzone */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          add(e.dataTransfer.files)
        }}
        className={cn(
          "group flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          disabled
            ? "cursor-not-allowed border-border bg-muted/30 opacity-70"
            : dragging
              ? "scale-[1.01] border-primary bg-primary/10"
              : "border-border hover:border-primary/60 hover:bg-primary/5"
        )}
      >
        <span
          className={cn(
            "grid size-12 place-items-center rounded-full transition-transform duration-300",
            disabled
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary group-hover:-translate-y-1",
            dragging && "-translate-y-1.5 scale-110"
          )}
        >
          {locked ? (
            <Lock className="size-5" />
          ) : dragging ? (
            <UploadCloud className="size-5" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </span>
        <span className="text-sm font-semibold">
          {locked
            ? "Photos unlock once the viewing is confirmed"
            : full
              ? "You've added all 5 photos"
              : dragging
                ? "Drop to upload"
                : "Drop photos here or tap to browse"}
        </span>
        <span className="text-xs text-muted-foreground">
          JPG, PNG or WebP · up to 5 MB each · {Math.max(MAX - total, 0)} left
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept={TYPES.join(",")}
        multiple
        hidden
        aria-label="Add viewing photos"
        onChange={(e) => {
          add(e.target.files)
          e.target.value = ""
        }}
      />

      {photos.isPending ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(tile, "animate-pulse")} />
          ))}
        </ul>
      ) : empty ? null : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {saved.map((photo, i) => (
            <li
              key={photo.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-in zoom-in-95 fade-in"
            >
              <button
                type="button"
                onClick={() => setViewing(i)}
                aria-label={`Open photo ${i + 1}`}
                className={cn(
                  tile,
                  "group block w-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Viewing evidence ${i + 1}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
              </button>
            </li>
          ))}
          {pending.map((item) => (
            <li key={item.key} className="animate-in zoom-in-95 fade-in">
              <div className={tile}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt=""
                  className={cn(
                    "size-full object-cover transition-opacity",
                    item.status === "uploading" ? "opacity-60" : "opacity-40"
                  )}
                />
                {item.status === "uploading" ? (
                  <>
                    <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <span className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                      <Loader2 className="size-3 animate-spin text-primary" />
                      Uploading…
                    </span>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-2 text-center backdrop-blur-[2px]">
                    <p className="line-clamp-2 text-[11px] font-medium text-destructive">
                      {item.error}
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => void send(item)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <RotateCcw className="size-3" /> Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => dismiss(item)}
                        aria-label="Remove photo"
                        className="grid size-6 place-items-center rounded-full bg-foreground text-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <PhotoLightbox
        photos={saved.map((photo, i) => ({
          id: photo.id,
          url: photo.url,
          alt: `Viewing evidence ${i + 1}`,
        }))}
        index={viewing}
        onIndexChange={setViewing}
        onClose={() => setViewing(null)}
        title="Photos from the viewing"
      />
    </section>
  )
}
