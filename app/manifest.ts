import type { MetadataRoute } from "next"

import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#2f6f46",
    categories: ["lifestyle", "business"],
    icons: [
      {
        src: "/brand/veridom-mark-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/veridom-mark-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      { name: "Browse properties", url: "/properties" },
      { name: "My account", url: "/account" },
    ],
  }
}
