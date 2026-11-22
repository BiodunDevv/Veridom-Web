"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Trash2,
  X,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import { Button } from "@/components/ui/button"
import type { Photo } from "@/lib/api/lister"
import { cn } from "@/lib/utils"

const bySize = (p: Photo) =>
  [...(p.variants ?? [])].sort((a, b) => a.width - b.width)
const largest = (p: Photo) => bySize(p).at(-1)?.url
const smallest = (p: Photo) => bySize(p)[0]?.url

/**
 * Full-screen photo viewer that slides in from the right. Arrow keys and
 * swipes move between photos; the strip below jumps to any one.
 */
export function PhotoViewer({
  photos,
  index,
  onIndexChange,
  onClose,
  disabled,
  onMakeCover,
  onDelete,
  busy,
}: {
  photos: Photo[]
  /** null keeps the viewer closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  disabled?: boolean
  onMakeCover: (photoId: string) => void
  onDelete: (photoId: string) => void
  busy?: boolean
}) {
  const open = index !== null && photos.length > 0
  const current = open ? Math.min(index!, photos.length - 1) : 0
  const photo = photos[current]
  const [loaded, setLoaded] = React.useState<string | null>(null)
  const touch = React.useRef<number | null>(null)
  const strip = React.useRef<HTMLDivElement>(null)

  const go = React.useCallback(
    (delta: number) => {
      if (!photos.length) return
      onIndexChange((current + delta + photos.length) % photos.length)
    },
    [current, onIndexChange, photos.length]
  )

  // Keep the active thumbnail in view.
  React.useEffect(() => {
    if (!open) return
    strip.current
      ?.querySelector<HTMLElement>(`[data-index="${current}"]`)
      ?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      })
  }, [current, open])

  // Warm the neighbours so paging feels instant.
  React.useEffect(() => {
    if (!open) return
    for (const d of [-1, 1]) {
      const url = largest(photos[(current + d + photos.length) % photos.length])
      if (url) new Image().src = url
    }
  }, [current, open, photos])

  if (!photo && !open) return null

  const url = photo ? largest(photo) : undefined

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1)
            if (e.key === "ArrowLeft") go(-1)
          }}
          className="fixed inset-0 z-[70] flex flex-col bg-neutral-950 text-white duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-full data-closed:animate-out data-closed:duration-250 data-closed:fade-out-0 data-closed:slide-out-to-right-full"
        >
          <DialogPrimitive.Title className="sr-only">
            Photo {current + 1} of {photos.length}
          </DialogPrimitive.Title>

          <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 font-medium tabular-nums">
                {current + 1} / {photos.length}
              </span>
              {current === 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  <Star className="size-3" aria-hidden /> Cover
                </span>
              ) : null}
              {photo && photo.status !== "READY" ? (
                <StatusBadge status={photo.status} />
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {!disabled && current !== 0 && photo ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    onMakeCover(photo.id)
                    onIndexChange(0)
                  }}
                >
                  <Star /> <span className="hidden sm:inline">Make cover</span>
                </Button>
              ) : null}
              {!disabled && photo ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => onDelete(photo.id)}
                  aria-label="Delete photo"
                >
                  {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              ) : null}
              <DialogPrimitive.Close asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Close viewer"
                >
                  <X />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </header>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return
              const dx = e.changedTouches[0].clientX - touch.current
              touch.current = null
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
            }}
          >
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => go(-1)}
                  className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 sm:left-4"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => go(1)}
                  className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 sm:right-4"
                >
                  <ChevronRight />
                </button>
              </>
            ) : null}

            {url ? (
              <>
                {loaded !== url ? (
                  <Loader2
                    className="absolute size-6 animate-spin text-white/60"
                    aria-hidden
                  />
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={photo.id}
                  src={url}
                  alt={`Photo ${current + 1}`}
                  ref={(el) => {
                    // Cached images can finish before onLoad is attached.
                    if (el?.complete && el.naturalWidth) setLoaded(url)
                  }}
                  onLoad={() => setLoaded(url)}
                  className={cn(
                    "max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300",
                    loaded === url ? "opacity-100" : "opacity-0"
                  )}
                />
              </>
            ) : (
              <p className="text-sm text-white/60">
                This photo is still being processed.
              </p>
            )}
          </div>

          <div
            ref={strip}
            className="flex gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:justify-center sm:px-6"
            role="tablist"
            aria-label="Photos"
          >
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Show photo ${i + 1}`}
                data-index={i}
                onClick={() => onIndexChange(i)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-white/10 transition-[opacity,box-shadow] sm:h-16 sm:w-24",
                  i === current
                    ? "opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-neutral-950"
                    : "opacity-50 hover:opacity-90"
                )}
              >
                {smallest(p) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={smallest(p)}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
