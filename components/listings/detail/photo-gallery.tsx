"use client"

import * as React from "react"

import { ListingImage } from "@/components/listings/listing-image"
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
  const current = photos[Math.min(active, photos.length - 1)]

  if (!current) {
    return (
      <div className="grid h-72 place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
        No photos yet
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-72 overflow-hidden rounded-xl bg-muted sm:h-96 lg:h-[30rem]">
        <ListingImage
          variants={current.variants}
          alt={`${title}, photo ${active + 1} of ${photos.length}`}
          sizes="(min-width: 1024px) 65vw, 100vw"
          priority
          className="size-full"
        />
      </div>
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
    </div>
  )
}
