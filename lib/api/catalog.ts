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
export type Location = { id: string; name: string; slug?: string }

const get = async <T>(path: string) =>
  (await apiRequest<ApiSuccess<T>>(path)).data

export const catalogApi = {
  propertyTypes: () => get<PropertyType[]>("/api/v1/catalog/property-types"),
  amenities: () => get<AmenityCluster[]>("/api/v1/catalog/amenities"),
  locations: (parentId?: string) =>
    get<Location[]>(
      `/api/v1/catalog/locations${parentId ? `?parentId=${parentId}` : ""}`
    ),
}
