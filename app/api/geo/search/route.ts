import { NextResponse } from "next/server"

const token = () => process.env.MAPBOX_SECRET_TOKEN

type Feature = {
  id: string
  properties: {
    name?: string
    full_address?: string
    place_formatted?: string
    feature_type?: string
    bbox?: [number, number, number, number]
  }
  geometry: { coordinates: [number, number] }
}

/** Address search for Nigeria. The Mapbox secret stays on the server. */
export async function GET(request: Request) {
  const key = token()
  if (!key) {
    return NextResponse.json(
      { error: "Maps are not configured." },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim()
  if (q.length < 2 || q.length > 120) {
    return NextResponse.json({ results: [] })
  }

  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward")
  url.searchParams.set("q", q)
  url.searchParams.set("country", "ng")
  url.searchParams.set("limit", "6")
  url.searchParams.set("language", "en")
  url.searchParams.set("access_token", key)
  const proximity = searchParams.get("proximity")
  if (proximity && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(proximity)) {
    url.searchParams.set("proximity", proximity)
  }

  // Optional: restrict to administrative areas (state, LGA, neighbourhood).
  const scope = searchParams.get("scope")
  if (scope === "state") {
    url.searchParams.set("types", "region")
    url.searchParams.set("limit", "1")
  } else if (scope === "place") {
    // Neighbourhood-level places, optionally boxed in to one LGA.
    url.searchParams.set("types", "neighborhood,locality,place,district")
    const bbox = searchParams.get("bbox")
    if (bbox && /^(-?\d+(\.\d+)?,){3}-?\d+(\.\d+)?$/.test(bbox)) {
      url.searchParams.set("bbox", bbox)
    }
  } else if (scope === "area") {
    url.searchParams.set("types", "region,district,place,locality,neighborhood")
    url.searchParams.set("limit", "3")
  }

  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) {
    return NextResponse.json({ results: [] }, { status: 502 })
  }
  const data = (await response.json()) as { features?: Feature[] }

  return NextResponse.json({
    results: (data.features ?? []).map((f) => ({
      id: f.id,
      name: f.properties.name ?? "",
      label: f.properties.full_address ?? f.properties.place_formatted ?? "",
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      bbox: f.properties.bbox ?? null,
    })),
  })
}
