import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl().origin
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/lister", "/account", "/auth", "/api", "/backend"],
    },
    sitemap: `${origin}/sitemap.xml`,
  }
}
