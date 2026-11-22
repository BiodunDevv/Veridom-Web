"use client"

import * as React from "react"
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { ListingImage } from "@/components/listings/listing-image"
import { Button } from "@/components/ui/button"
import {
  useOrderPhotos,
  usePhotos,
  useRemovePhoto,
  useUploadPhoto,
} from "@/features/lister/listing-hooks"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX_BYTES = 10 * 1024 * 1024

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
      className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6"
      aria-labelledby="photos-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="photos-title" className="text-lg font-semibold">
            Photos
          </h2>
          <p className="text-sm text-muted-foreground">
            At least 3, up to 30. JPEG, PNG or WebP, 10 MB each. The first photo
            is the cover. Location data is removed automatically.
          </p>
        </div>
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

      {photos.length === 0 ? (
        <p className="rounded-lg bg-muted/60 p-6 text-center text-sm text-muted-foreground">
          No photos yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <ListingImage
                  variants={photo.variants}
                  alt={`Photo ${index + 1}`}
                  sizes="25vw"
                  className="size-full"
                />
                {index === 0 ? (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    <Star className="size-3" /> Cover
                  </span>
                ) : null}
              </div>
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
    </section>
  )
}
