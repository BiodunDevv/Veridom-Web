import type { PhotoVariant } from "@/lib/api/listings"
import { cn } from "@/lib/utils"

/** Responsive photo from the API's 320/800/1600 WebP variants. */
export function ListingImage({
  variants,
  alt,
  sizes,
  priority,
  className,
}: {
  variants?: PhotoVariant[]
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  const sorted = [...(variants ?? [])].sort((a, b) => a.width - b.width)

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-muted text-sm text-muted-foreground",
          className
        )}
      >
        No photo
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sorted[Math.min(1, sorted.length - 1)].url}
      srcSet={sorted.map((v) => `${v.url} ${v.width}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  )
}
