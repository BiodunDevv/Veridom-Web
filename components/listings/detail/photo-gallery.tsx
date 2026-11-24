"use client"

import * as React from "react"

import { Expand } from "lucide-react"

import { ListingImage } from "@/components/listings/listing-image"
import { PhotoLightbox } from "@/components/ui/photo-lightbox"
import type { ListingDetail } from "@/lib/api/listings"
import { cn } from "@/lib/utils"

export function PhotoGallery({
  photos,
  title,
}: {
  photos: ListingDetail["photos"]
  title: string
}) {
  const [active, setActive] = React.useState(0)
  const [open, setOpen] = React.useState<number | null>(null)
  const current = photos[Math.min(active, photos.length - 1)]
  const slides = React.useMemo(
    () =>
      photos.map((photo, i) => {
        const sized = [...(photo.variants ?? [])].sort(
          (a, b) => a.width - b.width
        )
        return {
          id: photo.id,
          url: sized.at(-1)?.url,
          thumb: sized[0]?.url,
          alt: `${title}, photo ${i + 1} of ${photos.length}`,
        }
      }),
    [photos, title]
  )

  if (!current) {
    return (
      <div className="grid h-72 place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
        No photos yet
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(active)}
        aria-label={`Open photo ${active + 1} of ${photos.length} full screen`}
        className="group relative block h-72 w-full cursor-zoom-in overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-96 lg:h-[30rem]"
      >
        <ListingImage
          variants={current.variants}
          alt={`${title}, photo ${active + 1} of ${photos.length}`}
          sizes="(min-width: 1024px) 65vw, 100vw"
          priority
          className="size-full transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur transition-transform group-hover:scale-105">
          <Expand className="size-3.5" aria-hidden />
          {photos.length > 1
            ? `View all ${photos.length} photos`
            : "View full screen"}
        </span>
      </button>
      {photos.length > 1 ? (
        <ul
          className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8"
          aria-label="Photos"
        >
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-md transition-opacity outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  index === active
                    ? "opacity-100 ring-2 ring-primary"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <ListingImage
                  variants={photo.variants}
                  alt=""
                  sizes="12vw"
                  className="size-full"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <PhotoLightbox
        photos={slides}
        index={open}
        onIndexChange={(i) => {
          setOpen(i)
          setActive(i)
        }}
        onClose={() => setOpen(null)}
        title={title}
      />
    </div>
  )
}
