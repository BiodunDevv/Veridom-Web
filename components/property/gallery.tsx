"use client"

import * as React from "react"
import Image from "next/image"

import { IconMask } from "@/components/landing/icon-mask"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Gallery({
  images,
  name,
  tint,
}: {
  images: string[]
  name: string
  tint?: string
}) {
  const multiple = images.length > 1
  const pages = Math.max(1, Math.ceil(images.length / 2))
  const [page, setPage] = React.useState(0)
  const visible = images.slice(page * 2, page * 2 + 2)

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-secondary p-3 sm:gap-6 sm:p-6 lg:p-10">
      {multiple ? (
        <ul className="grid w-full grid-cols-5 gap-2 rounded-xl bg-card p-2 sm:p-3 lg:grid-cols-10" aria-label="Thumbnails">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={Math.floor(index / 2) === page}
                onClick={() => setPage(Math.floor(index / 2))}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-md outline-none transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50",
                  Math.floor(index / 2) === page ? "opacity-100" : "opacity-50 hover:opacity-80"
                )}
              >
                <Image src={src} alt="" fill sizes="10vw" className={cn("object-cover", tint)} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={cn("grid w-full gap-3 sm:gap-5", visible.length > 1 && "md:grid-cols-2")}>
        {visible.map((src, index) => (
          <div key={src} className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-[420px]">
            <Image
              src={src}
              alt={`${name} photo ${page * 2 + index + 1}`}
              fill
              priority={page === 0}
              sizes="(min-width: 768px) 45vw, 100vw"
              className={cn("object-cover", tint)}
            />
          </div>
        ))}
      </div>

      {multiple ? (
        <div className="flex items-center gap-3 rounded-full bg-card p-2.5 shadow-md">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            aria-label="Previous photos"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <IconMask src="/property/icon-prev.svg" className="size-4" />
          </Button>
          <div className="flex w-28 gap-1" aria-hidden>
            {Array.from({ length: pages }).map((_, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", i === page ? "bg-primary" : "bg-muted-foreground/30")} />
            ))}
          </div>
          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-full"
            aria-label="Next photos"
            disabled={page === pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          >
            <IconMask src="/property/icon-next.svg" className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
