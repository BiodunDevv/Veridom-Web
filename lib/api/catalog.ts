import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"

export type PropertyType = {
  id: string
  slug: string
  name: string
  children?: PropertyType[]
}
export type Amenity = {
  id: string
  slug: string
  name: string
  icon?: string | null
}
export type AmenityCluster = {
  id: string
  slug: string
  name: string
  amenities: Amenity[]
}
export type Location = {
  id: string
  name: string
  slug?: string
  parentId?: string | null
  kind?: "STATE" | "LGA" | "AREA"
}
/** A search hit: the place plus its full path, e.g. "Lekki Phase I, Eti Osa, Lagos". */
export type LocationHit = Location & { stateId?: string; path?: string }
export type CreatedLocation = Location & { created: boolean }

const get = async <T>(path: string) =>
  (await apiRequest<ApiSuccess<T>>(path)).data

const post = async <T>(path: string, body: unknown) =>
  (
    await apiRequest<ApiSuccess<T>>(path, {
      method: "POST",
      body: JSON.stringify(body),
    })
  ).data

export const catalogApi = {
  propertyTypes: () => get<PropertyType[]>("/api/v1/catalog/property-types"),
  amenities: () => get<AmenityCluster[]>("/api/v1/catalog/amenities"),
  /** Neighbourhood search. Under an LGA it may take 1 to 3 seconds the first time. */
  searchLocations: (q: string, parentId?: string) =>
    get<LocationHit[]>(
      `/api/v1/catalog/locations/search?q=${encodeURIComponent(q)}${
        parentId ? `&parentId=${parentId}` : ""
      }`
    ),
  /** Anyone signed in can add a missing neighbourhood. Safe to repeat. */
  createNeighbourhood: (body: { name: string; parentId: string }) =>
    post<CreatedLocation>("/api/v1/catalog/locations", body),
  locations: (parentId?: string) =>
    get<Location[]>(
      `/api/v1/catalog/locations${parentId ? `?parentId=${parentId}` : ""}`
    ),
}
