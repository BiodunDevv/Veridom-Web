import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl().origin
  const pages = [
    "",
    "/properties",
    "/services",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ]
  return pages.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency:
      path === "/properties" || path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/properties" ? 0.9 : 0.5,
  }))
}
