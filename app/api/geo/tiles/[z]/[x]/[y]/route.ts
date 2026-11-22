const STYLES: Record<string, string> = {
  light: "streets-v12",
  dark: "dark-v11",
}

/** Serves map tiles so the Mapbox secret never reaches the browser. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const key = process.env.MAPBOX_SECRET_TOKEN
  if (!key) return new Response("Maps are not configured.", { status: 503 })

  const { z, x, y } = await params
  const zi = Number(z)
  const xi = Number(x)
  const yi = Number(y)
  const max = 2 ** zi
  if (
    ![zi, xi, yi].every(Number.isInteger) ||
    zi < 0 ||
    zi > 19 ||
    xi < 0 ||
    yi < 0 ||
    xi >= max ||
    yi >= max
  ) {
    return new Response("Bad tile.", { status: 400 })
  }

  const style =
    STYLES[new URL(request.url).searchParams.get("style") ?? "light"] ??
    STYLES.light
  const upstream = await fetch(
    `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/512/${zi}/${xi}/${yi}?access_token=${key}`,
    { next: { revalidate: 604_800 } }
  )
  if (!upstream.ok) return new Response("Tile unavailable.", { status: 502 })

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  })
}
