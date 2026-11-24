"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type LightboxPhoto = {
  id: string
  /** The big image shown on screen. */
  url?: string
  /** A small image for the strip underneath (falls back to `url`). */
  thumb?: string
  alt?: string
}

/**
 * Full-screen photo viewer that slides in from the right, the same one the
 * lister area uses. Arrow keys and swipes move between photos, and the strip
 * underneath jumps to any one.
 */
export function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  title,
}: {
  photos: LightboxPhoto[]
  /** null keeps the viewer closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  title?: string
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
      const url = photos[(current + d + photos.length) % photos.length]?.url
      if (url) new Image().src = url
    }
  }, [current, open, photos])

  if (!photo && !open) return null

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
          className="fixed inset-0 z-[80] flex flex-col bg-neutral-950 text-white duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-full data-closed:animate-out data-closed:duration-250 data-closed:fade-out-0 data-closed:slide-out-to-right-full"
        >
          <DialogPrimitive.Title className="sr-only">
            {title ?? "Photo"} {current + 1} of {photos.length}
          </DialogPrimitive.Title>

          <header className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
            <div className="flex min-w-0 items-center gap-3 text-sm">
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 font-medium tabular-nums">
                {current + 1} / {photos.length}
              </span>
              {title ? (
                <span className="truncate text-white/70">{title}</span>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="Close viewer"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors outline-none hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-white/40"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
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

            {photo?.url ? (
              <>
                {loaded !== photo.url ? (
                  <Loader2
                    className="absolute size-6 animate-spin text-white/60"
                    aria-hidden
                  />
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.alt ?? `Photo ${current + 1}`}
                  ref={(el) => {
                    // Cached images can finish before onLoad is attached.
                    if (el?.complete && el.naturalWidth) setLoaded(photo.url!)
                  }}
                  onLoad={() => setLoaded(photo.url!)}
                  className={cn(
                    "max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300",
                    loaded === photo.url ? "opacity-100" : "opacity-0"
                  )}
                />
              </>
            ) : (
              <p className="text-sm text-white/60">
                This photo isn&apos;t available.
              </p>
            )}
          </div>

          {photos.length > 1 ? (
            <div
              ref={strip}
              role="tablist"
              aria-label="Photos"
              className="flex gap-2 overflow-x-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] [scrollbar-width:none] sm:justify-center sm:px-6"
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
                  {(p.thumb ?? p.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumb ?? p.url}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
