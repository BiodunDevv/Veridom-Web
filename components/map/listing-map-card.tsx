"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"

const ListingMap = dynamic(() => import("./listing-map"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-2xl bg-muted sm:h-80" />
  ),
})

/** Location card for the property page. */
export function ListingMapCard({
  lat,
  lng,
  place,
}: {
  lat: number
  lng: number
  place?: string
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="size-5 text-primary" /> Area
        </h2>
      </div>
      {place ? <p className="text-sm text-muted-foreground">{place}</p> : null}
      <ListingMap lat={lat} lng={lng} />
      <p className="text-xs text-muted-foreground">
        Approximate area. The exact address is shared once your viewing is
        confirmed.
      </p>
    </section>
  )
}
