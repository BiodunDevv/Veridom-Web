import { NextResponse } from "next/server"
import sharp from "sharp"

import { fetchListingServer } from "@/lib/api/server-listings"

export const runtime = "nodejs"

const W = 1200
const H = 630

/** Veridom mark and a soft bottom fade over the photo, so shares read as ours. */
const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#06180f" stop-opacity="0"/>
      <stop offset="100%" stop-color="#06180f" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g transform="translate(48 ${H - 128})">
    <rect width="80" height="80" rx="20" fill="#0f2e1f"/>
    <g transform="translate(40 40) scale(.72) translate(-45.5 -46)">
      <path d="M16.79 28.38c.18-3.27 2.98-5.77 6.25-5.59h.04c1.4.04 2.76.54 3.85 1.44 8.05 7.4 12.12 18.19 10.97 29.06 0 .5-.65.48-.81 0-2.18-7.4-9.37-15.9-15.74-18.44-2.84-.83-4.74-3.51-4.56-6.47Z" fill="#7be3a8"/>
      <path d="M71.93 27.77c-.14-4.98-4.3-8.91-9.28-8.77-.14 0-.28.01-.41.02-10.92.24-25.62 28.36-17.21 53.9 0 .52.6.42.65-.1 1.17-17.78 11.83-31.63 21.42-37.09 3.13-1.42 5.05-4.63 4.83-8.06Z" fill="#34d27b"/>
      <path d="M12.01 53.51c.2 3.09 2.85 5.45 5.95 5.3 6.76.24 13.28 2.6 18.62 6.75.38.32.44.2.2-.65-1.85-6.49-11.79-17.37-19.01-17.37-3.13-.06-5.71 2.42-5.78 5.55 0 .17 0 .33.01.5Z" fill="#22b862"/>
      <path d="M78.99 53.51c-.2 3.09-2.85 5.45-5.95 5.3-6.76.24-13.28 2.6-18.62 6.75-.38.32-.44.2-.2-.65 1.85-6.49 11.79-17.37 19.01-17.37 3.13-.06 5.71 2.42 5.78 5.55 0 .17 0 .33-.01.5Z" fill="#a6f0c6"/>
    </g>
  </g>
</svg>`

/**
 * Link-preview image for one listing: its cover photo, cropped to 1200x630,
 * with the Veridom mark. JPEG and small, which WhatsApp needs to show it.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fallback = () =>
    NextResponse.redirect(new URL("/opengraph-image", request.url), 307)

  const listing = await fetchListingServer(id)
  const variants = listing?.photos?.[0]?.variants?.length
    ? listing.photos[0].variants
    : listing?.cover
  const best = [...(variants ?? [])].sort((a, b) => b.width - a.width)[0]
  if (!best) return fallback()

  try {
    const url = new URL(best.url)
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback()
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return fallback()
    const input = Buffer.from(await res.arrayBuffer())
    if (input.byteLength > 15 * 1024 * 1024) return fallback()

    const jpeg = await sharp(input)
      .rotate()
      .resize(W, H, { fit: "cover", position: "attention" })
      .composite([{ input: Buffer.from(overlay) }])
      .jpeg({ quality: 76, mozjpeg: true })
      .toBuffer()

    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "content-type": "image/jpeg",
        "cache-control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch {
    return fallback()
  }
}
