import { NextResponse } from "next/server"

import { inNigeria } from "@/lib/geo/nigeria"

type Feature = {
  properties: { name?: string; full_address?: string; place_formatted?: string }
}

/** Turns a pin into a readable place. */
export async function GET(request: Request) {
  const key = process.env.MAPBOX_SECRET_TOKEN
  if (!key) {
    return NextResponse.json(
      { error: "Maps are not configured." },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inNigeria(lat, lng)) {
    return NextResponse.json(
      { error: "That point is outside Nigeria." },
      { status: 422 }
    )
  }

  const url = new URL("https://api.mapbox.com/search/geocode/v6/reverse")
  url.searchParams.set("longitude", String(lng))
  url.searchParams.set("latitude", String(lat))
  url.searchParams.set("language", "en")
  url.searchParams.set("limit", "1")
  url.searchParams.set("access_token", key)

  const response = await fetch(url, { next: { revalidate: 86_400 } })
  if (!response.ok) return NextResponse.json({ label: "", name: "" })
  const data = (await response.json()) as { features?: Feature[] }
  const first = data.features?.[0]

  return NextResponse.json({
    name: first?.properties.name ?? "",
    label:
      first?.properties.full_address ?? first?.properties.place_formatted ?? "",
  })
}
