"use client"

import * as React from "react"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useTheme } from "next-themes"

import { rasterStyle } from "./map-core"

const circle = (lat: number, lng: number, meters: number) => {
  const points: [number, number][] = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2
    points.push([
      lng +
        (meters * Math.cos(a)) / (111_320 * Math.cos((lat * Math.PI) / 180)),
      lat + (meters * Math.sin(a)) / 110_540,
    ])
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [points] },
  }
}

/** The public map shows an area, not the doorstep. The exact address comes with a confirmed viewing. */
export default function ListingMap({ lat, lng }: { lat: number; lng: number }) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const box = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<maplibregl.Map | null>(null)

  React.useEffect(() => {
    const el = box.current
    if (!el) return
    // Shift the centre a little, the same way every time, so the area does not point at the door.
    const seed = Math.abs(Math.sin(lat * 1000 + lng * 777))
    const cLat = lat + (seed - 0.5) * 0.0016
    const cLng = lng + (((seed * 7) % 1) - 0.5) * 0.0016

    const map = new maplibregl.Map({
      container: el,
      style: rasterStyle(dark),
      center: [cLng, cLat],
      zoom: 14.5,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    })
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    )
    const draw = () => {
      if (map.getSource("area")) return
      map.addSource("area", { type: "geojson", data: circle(cLat, cLng, 320) })
      map.addLayer({
        id: "area-fill",
        type: "fill",
        source: "area",
        paint: { "fill-color": "#00a050", "fill-opacity": 0.2 },
      })
      map.addLayer({
        id: "area-line",
        type: "line",
        source: "area",
        paint: { "line-color": "#00a050", "line-width": 2.5 },
      })
    }
    map.on("style.load", draw)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  React.useEffect(() => {
    mapRef.current?.setStyle(rasterStyle(dark))
  }, [dark])

  return <div ref={box} className="h-72 w-full rounded-2xl bg-muted sm:h-80" />
}
