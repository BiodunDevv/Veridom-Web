import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

import { NextResponse } from "next/server"

export const runtime = "nodejs"

const MAX_BYTES = 10 * 1024 * 1024
const MAX_REDIRECTS = 3
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"])

const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

/** True for loopback, private, link-local and other non-public addresses. */
function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const a = address.toLowerCase()
    if (a.startsWith("::ffff:")) return isPrivateAddress(a.slice(7))
    return (
      a === "::1" ||
      a === "::" ||
      a.startsWith("fc") ||
      a.startsWith("fd") ||
      a.startsWith("fe8") ||
      a.startsWith("fe9") ||
      a.startsWith("fea") ||
      a.startsWith("feb")
    )
  }
  const [a, b] = address.split(".").map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

async function assertPublic(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http and https links are supported.")
  }
  if (url.username || url.password) {
    throw new Error("Links with a login in them aren't supported.")
  }
  const records = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true })
  if (!records.length || records.some((r) => isPrivateAddress(r.address))) {
    throw new Error("That link points to a private address.")
  }
}

/**
 * Fetches a public image link on the server so the browser can upload it
 * through the normal photo flow without running into CORS. Same-origin only,
 * public hosts only, images only, 10 MB at most.
 */
export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return fail("Not allowed.", 403)
  }

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return fail("Send a JSON body with a url.")
  }
  const raw = (input as { url?: unknown })?.url
  if (typeof raw !== "string" || raw.length > 2048) {
    return fail("Enter a valid image link.")
  }

  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return fail("That doesn't look like a link.")
  }

  try {
    let response: Response | null = null
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublic(url)
      response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(12_000),
        headers: {
          accept: "image/jpeg,image/png,image/webp;q=0.9",
          "user-agent": "VeridomPhotoImport/1.0",
        },
      })
      const location = response.headers.get("location")
      if (response.status >= 300 && response.status < 400 && location) {
        url = new URL(location, url)
        continue
      }
      break
    }

    if (!response || !response.ok) {
      return fail("We couldn't open that link.", 422)
    }
    const type = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase()
    if (!ALLOWED.has(type)) {
      return fail("That link isn't a JPEG, PNG or WebP image.", 415)
    }
    const declared = Number(response.headers.get("content-length") ?? 0)
    if (declared > MAX_BYTES) return fail("That image is over 10 MB.", 413)

    const reader = response.body?.getReader()
    if (!reader) return fail("We couldn't read that image.", 422)
    const chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > MAX_BYTES) {
        await reader.cancel()
        return fail("That image is over 10 MB.", 413)
      }
      chunks.push(value)
    }

    return new NextResponse(Buffer.concat(chunks), {
      headers: { "content-type": type, "cache-control": "no-store" },
    })
  } catch (error) {
    return fail(
      error instanceof Error && error.name !== "TimeoutError"
        ? error.message
        : "That link took too long to respond.",
      422
    )
  }
}
