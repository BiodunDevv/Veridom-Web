"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { ImagePlus, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { inspectionsApi } from "@/lib/api/deals"
import { putToStorage } from "@/lib/api/lister"
import { queryKeys } from "@/lib/query/keys"
import { useAction } from "@/lib/query/use-action"

const MAX = 5
const MAX_BYTES = 5 * 1024 * 1024

/** Private proof photos from a viewing: up to 5, 5 MB each. Only you and the Veridom team can see them. */
export function EvidencePhotos({ inspectionId }: { inspectionId: string }) {
  const photos = useQuery({
    queryKey: queryKeys.inspectionPhotos(inspectionId),
    queryFn: () => inspectionsApi.photos(inspectionId),
    retry: false,
  })
  const upload = useAction(
    async (file: File) => {
      const presign = await inspectionsApi.presignPhoto(inspectionId, {
        contentType: file.type,
        sizeBytes: file.size,
      })
      await putToStorage(presign, file)
      await inspectionsApi.confirmPhoto(inspectionId, presign.photoId)
    },
    {
      success: "Photo added.",
      invalidate: [queryKeys.inspectionPhotos(inspectionId)],
    }
  )
  const items = photos.data ?? []
  const full = items.length >= MAX

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Photos from the viewing</h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" /> Private. Up to {MAX}{" "}
            photos, 5 MB each. They help if there&apos;s ever a dispute.
          </p>
        </div>
        <Button asChild variant="outline" aria-disabled={full}>
          <label
            className={
              full ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          >
            {upload.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus />
            )}{" "}
            Add photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={full}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f && f.size <= MAX_BYTES) upload.mutate(f)
                e.target.value = ""
              }}
            />
          </label>
        </Button>
      </div>
      {items.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((photo) => (
            <li
              key={photo.id}
              className="aspect-[4/3] overflow-hidden rounded-lg bg-muted"
            >
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt="Viewing evidence"
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
          No photos yet.
        </p>
      )}
    </section>
  )
}
