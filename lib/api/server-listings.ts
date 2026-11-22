import type { ListingDetail } from "@/lib/api/listings"

/** Server-side listing fetch for metadata and link-preview images. */
export async function fetchListingServer(
  id: string
): Promise<ListingDetail | null> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "")
  if (!base || !/^[\w-]{1,64}$/.test(id)) return null
  try {
    const res = await fetch(`${base}/api/v1/listings/${id}`, {
      headers: { "X-Veridom-Client": "web", accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const body = (await res.json()) as { data?: ListingDetail }
    return body.data ?? null
  } catch {
    return null
  }
}
