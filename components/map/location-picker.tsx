"use client"

import * as React from "react"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useTheme } from "next-themes"
import { Crosshair, Loader2, MapPin, Search, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { DEFAULT_CENTER, inNigeria } from "@/lib/geo/nigeria"

import { createPin, nigeriaBounds, rasterStyle } from "./map-core"

type Result = {
  id: string
  name: string
  label: string
  lat: number
  lng: number
  bbox?: [number, number, number, number] | null
}

/** The place chosen in the form's State / LGA / Neighbourhood selects. */
export type AreaFocus = {
  /** Text to geocode, most specific first, e.g. "Ikeja, Lagos". */
  query: string
  level: "state" | "lga" | "neighbourhood"
  /** Short name shown on the map, e.g. "Ikeja". */
  label: string
}

type Box = [number, number, number, number]
const MAX_ZOOM = { state: 9, lga: 12.5, neighbourhood: 14.5 } as const
const insideBox = (b: Box, la: number, ln: number) => {
  const padX = (b[2] - b[0]) * 0.08
  const padY = (b[3] - b[1]) * 0.08
  return (
    ln >= b[0] - padX &&
    ln <= b[2] + padX &&
    la >= b[1] - padY &&
    la <= b[3] + padY
  )
}

/** Search an address or click and drag a pin; the pin gives the listing its coordinates. */
export function LocationPicker({
  lat,
  lng,
  onChange,
  onUseAddress,
  onNeighbourhood,
  focus,
  disabled,
}: {
  focus?: AreaFocus | null
  lat?: number
  lng?: number
  onChange: (lat: number | null, lng: number | null) => void
  onUseAddress?: (address: string) => void
  /** The neighbourhood the pin sits in, from the map data ("" when unknown). */
  onNeighbourhood?: (name: string) => void
  disabled?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  const box = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<maplibregl.Map | null>(null)
  const pinRef = React.useRef<maplibregl.Marker | null>(null)
  const changeRef = React.useRef(onChange)
  const onNeighbourhoodRef = React.useRef(onNeighbourhood)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<Result[]>([])
  const [searching, setSearching] = React.useState(false)
  const [near, setNear] = React.useState("")
  const [areaBox, setAreaBox] = React.useState<Box | null>(null)
  const [areaBusy, setAreaBusy] = React.useState(false)
  const areaCenter = React.useRef<{ lng: number; lat: number } | null>(null)
  const hasPin = lat !== undefined && lng !== undefined

  React.useEffect(() => {
    changeRef.current = onChange
    onNeighbourhoodRef.current = onNeighbourhood
  }, [onChange, onNeighbourhood])

  const place = React.useCallback((nextLat: number, nextLng: number) => {
    if (!inNigeria(nextLat, nextLng)) {
      toast.error("Pins must be inside Nigeria.")
      return
    }
    changeRef.current(Number(nextLat.toFixed(6)), Number(nextLng.toFixed(6)))
  }, [])

  // Build the map once.
  React.useEffect(() => {
    const el = box.current
    if (!el) return
    const start = hasPin ? { lat: lat!, lng: lng! } : DEFAULT_CENTER
    const map = new maplibregl.Map({
      container: el,
      style: rasterStyle(dark),
      center: [start.lng, start.lat],
      zoom: hasPin ? 15 : 11,
      maxBounds: nigeriaBounds,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    })
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    )
    map.on("click", (e) => {
      if (!disabled) place(e.lngLat.lat, e.lngLat.lng)
    })
    mapRef.current = map
    return () => {
      pinRef.current?.remove()
      pinRef.current = null
      map.remove()
      mapRef.current = null
    }
    // The map is created once; later changes flow through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow the theme.
  React.useEffect(() => {
    mapRef.current?.setStyle(rasterStyle(dark))
  }, [dark])

  // Keep the pin in step with the value.
  React.useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!hasPin) {
      pinRef.current?.remove()
      pinRef.current = null
      return
    }
    if (!pinRef.current) {
      const pin = new maplibregl.Marker({
        element: createPin(),
        anchor: "bottom",
        draggable: !disabled,
      })
        .setLngLat([lng!, lat!])
        .addTo(map)
      pin.on("dragend", () => {
        const p = pin.getLngLat()
        place(p.lat, p.lng)
      })
      pinRef.current = pin
    } else {
      pinRef.current.setLngLat([lng!, lat!])
      pinRef.current.setDraggable(!disabled)
    }
  }, [hasPin, lat, lng, disabled, place])

  // Fly to the state / LGA / neighbourhood picked in the form.
  const focusKey = focus ? `${focus.level}|${focus.query}` : ""
  React.useEffect(() => {
    if (!focus) {
      areaCenter.current = null
      return
    }
    const controller = new AbortController()
    ;(async () => {
      // Start after the render so state updates here never cascade.
      await Promise.resolve()
      if (controller.signal.aborted) return
      setAreaBusy(true)
      setResults([])
      try {
        const res = await fetch(
          `/api/geo/search?scope=${focus.level === "state" ? "state" : "area"}&q=${encodeURIComponent(focus.query)}`,
          { signal: controller.signal }
        )
        const data = (await res.json()) as { results?: Result[] }
        const hit = data.results?.find((r) => inNigeria(r.lat, r.lng))
        const map = mapRef.current
        if (!hit || !map) {
          setAreaBox(null)
          return
        }
        areaCenter.current = { lng: hit.lng, lat: hit.lat }
        const box = hit.bbox && hit.bbox.length === 4 ? (hit.bbox as Box) : null
        setAreaBox(box)
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
        if (box) {
          map.fitBounds(
            [
              [box[0], box[1]],
              [box[2], box[3]],
            ],
            {
              padding: 36,
              maxZoom: MAX_ZOOM[focus.level],
              duration: reduce ? 0 : 1400,
            }
          )
        } else {
          map.flyTo({
            center: [hit.lng, hit.lat],
            zoom: MAX_ZOOM[focus.level],
            duration: reduce ? 0 : 1400,
          })
        }
      } catch {
        // aborted or offline: the map just stays where it is
      } finally {
        setAreaBusy(false)
      }
    })()
    return () => controller.abort()
    // focusKey captures the only inputs that matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  // Debounced search.
  React.useEffect(() => {
    const q = query.trim()
    if (q.length < 3) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const c = areaCenter.current ?? mapRef.current?.getCenter()
        const prox = c ? `&proximity=${c.lng},${c.lat}` : ""
        const res = await fetch(
          `/api/geo/search?q=${encodeURIComponent(q)}${prox}`,
          {
            signal: controller.signal,
          }
        )
        const data = (await res.json()) as { results?: Result[] }
        setResults(data.results ?? [])
      } catch {
        // aborted or offline
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  // Name the place under the pin.
  React.useEffect(() => {
    if (!hasPin) {
      onNeighbourhoodRef.current?.("")
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`, {
          signal: controller.signal,
        })
        const data = (await res.json()) as {
          label?: string
          name?: string
          neighbourhood?: string
        }
        setNear(data.label || data.name || "")
        onNeighbourhoodRef.current?.(data.neighbourhood ?? "")
      } catch {
        // aborted or offline
      }
    }, 400)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [hasPin, lat, lng])

  const choose = (r: Result) => {
    setResults([])
    setQuery(r.label || r.name)
    place(r.lat, r.lng)
    mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: 16, duration: 1200 })
  }

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser can't share your location.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        place(pos.coords.latitude, pos.coords.longitude)
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 16,
          duration: 1200,
        })
      },
      () => toast.error("We couldn't get your location."),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <InputGroup className="h-11 rounded-xl bg-background">
          <InputGroupAddon align="inline-start" className="pl-3.5">
            {searching ? (
              <Loader2 className="size-[18px] animate-spin text-muted-foreground" />
            ) : (
              <Search className="size-[18px] text-muted-foreground" />
            )}
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.trim().length < 3) setResults([])
            }}
            disabled={disabled}
            placeholder="Search the street or building"
            aria-label="Search for the property address"
            autoComplete="off"
            className="h-full text-[15px] md:text-[15px]"
          />
          <InputGroupAddon align="inline-end" className="pr-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={locate}
              disabled={disabled}
              aria-label="Use my location"
            >
              <Crosshair />{" "}
              <span className="hidden sm:inline">Use my location</span>
            </Button>
          </InputGroupAddon>
        </InputGroup>
        {results.length ? (
          <ul className="absolute inset-x-0 top-12 z-20 overflow-hidden rounded-xl border bg-popover shadow-xl">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => choose(r)}
                  className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left text-sm transition-colors outline-none hover:bg-accent focus-visible:bg-accent"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {r.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.label}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-2xl border shadow-sm">
        <div ref={box} className="h-[22rem] w-full bg-muted" />
        {!hasPin ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-semibold shadow-md backdrop-blur">
            Click the map to drop a pin
          </p>
        ) : null}
      </div>

      {focus ? (
        <p
          className="flex items-center gap-2 text-xs text-muted-foreground"
          aria-live="polite"
        >
          {areaBusy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <MapPin className="size-3.5 text-primary" />
          )}
          {areaBusy ? "Finding" : "Showing"}{" "}
          <span className="font-semibold text-foreground">{focus.label}</span>
        </p>
      ) : null}
      {focus && hasPin && areaBox && !insideBox(areaBox, lat!, lng!) ? (
        <p
          role="status"
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
        >
          This pin looks outside {focus?.label ?? "the selected area"}. Move it
          or change the location above.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        {hasPin ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{near || "Pin dropped"}</p>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {lat!.toFixed(5)}, {lng!.toFixed(5)}
              </p>
            </div>
            <div className="flex gap-2">
              {onUseAddress && near ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onUseAddress(near.split(",")[0])}
                >
                  Use as street address
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  onChange(null, null)
                  setNear("")
                }}
              >
                <X /> Clear pin
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">
            No pin yet. A pin helps renters find the property; drag it to
            adjust.
          </p>
        )}
      </div>
    </div>
  )
}
