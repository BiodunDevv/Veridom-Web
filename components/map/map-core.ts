import * as maplibregl from "maplibre-gl"

// Turbopack can't bundle the worker, so it's served from /public (copied by
// scripts/copy-maplibre-worker.mjs before dev and build).
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs")

import { NIGERIA_BOUNDS } from "@/lib/geo/nigeria"

/** Raster style served by our own /api/geo/tiles proxy. */
export const rasterStyle = (dark: boolean): maplibregl.StyleSpecification => ({
  version: 8,
  sources: {
    base: {
      type: "raster",
      tiles: [
        `${window.location.origin}/api/geo/tiles/{z}/{x}/{y}?style=${dark ? "dark" : "light"}`,
      ],
      tileSize: 512,
      maxzoom: 18,
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    },
  },
  layers: [{ id: "base", type: "raster", source: "base" }],
})

export const nigeriaBounds: maplibregl.LngLatBoundsLike = [
  [NIGERIA_BOUNDS[0] - 1, NIGERIA_BOUNDS[1] - 1],
  [NIGERIA_BOUNDS[2] + 1, NIGERIA_BOUNDS[3] + 1],
]

/** A Veridom green pin. */
export function createPin(): HTMLElement {
  const el = document.createElement("div")
  el.className = "veridom-pin"
  el.innerHTML = `<svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 45C19 45 35 29.5 35 18.5C35 9.4 27.8 2 19 2C10.2 2 3 9.4 3 18.5C3 29.5 19 45 19 45Z" fill="#007f3d" stroke="#ffffff" stroke-width="3"/><circle cx="19" cy="18.5" r="6.5" fill="#ffffff"/></svg>`
  el.style.cssText =
    "cursor:grab;filter:drop-shadow(0 6px 8px rgba(0,0,0,.35));transform-origin:50% 100%;"
  return el
}
