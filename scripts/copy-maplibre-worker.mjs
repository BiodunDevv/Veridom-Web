// Turbopack can't bundle maplibre's web worker, so serve it as a static file.
// Runs before dev and build so it always matches the installed version.
import { copyFileSync, mkdirSync } from "node:fs"

mkdirSync("public/maplibre", { recursive: true })
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
  "public/maplibre/maplibre-gl-worker.mjs"
)
