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
    // A solid green tile with the leaf mark: phones never show it on white.
    // "maskable" keeps the mark inside the safe zone for round/squircle masks.
    icons: [
      {
        src: "/icons/app/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse properties",
        url: "/properties",
        icons: [{ src: "/icons/app/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My account",
        url: "/account",
        icons: [{ src: "/icons/app/icon-192.png", sizes: "192x192" }],
      },
    ],
  }
}
