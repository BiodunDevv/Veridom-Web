import type { Metadata } from "next"

export const SITE_NAME = "Veridom"
export const SITE_TAGLINE = "Verified homes, trusted deals"
export const SITE_DESCRIPTION =
  "Browse verified properties across Nigeria, book viewings and close deals securely with Veridom."

/**
 * The public origin used in link previews. Set NEXT_PUBLIC_SITE_URL in
 * production (e.g. https://veridom.ng); previews need an absolute public URL.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  const raw =
    explicit || (vercel ? `https://${vercel}` : "http://localhost:3000")
  try {
    return new URL(raw)
  } catch {
    return new URL("http://localhost:3000")
  }
}

/** Title, description, canonical URL and social cards for one page. */
export function pageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string
  description: string
  path: string
  images?: { url: string; width?: number; height?: number; alt?: string }[]
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_NG",
      title,
      description,
      url: path,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  }
}
