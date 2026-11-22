"use client"

import { useQuery } from "@tanstack/react-query"

import { catalogApi } from "@/lib/api/catalog"
import { queryKeys } from "@/lib/query/keys"

const FIVE_MINUTES = 5 * 60_000

export const usePropertyTypes = () =>
  useQuery({
    queryKey: queryKeys.catalog.propertyTypes,
    queryFn: catalogApi.propertyTypes,
    staleTime: FIVE_MINUTES,
  })

export const useAmenities = () =>
  useQuery({
    queryKey: queryKeys.catalog.amenities,
    queryFn: catalogApi.amenities,
    staleTime: FIVE_MINUTES,
  })

/** No parent gives the states; a state gives its LGAs; an LGA gives its areas. */
export const useLocations = (parentId?: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.catalog.locations(parentId),
    queryFn: () => catalogApi.locations(parentId),
    staleTime: FIVE_MINUTES,
    enabled,
  })

/** Debounced neighbourhood search under one LGA. */
export const useLocationSearch = (q: string, parentId?: string) => {
  const term = q.trim()
  return useQuery({
    queryKey: ["catalog", "location-search", parentId ?? "any", term] as const,
    queryFn: () => catalogApi.searchLocations(term, parentId),
    enabled: term.length >= 2 && Boolean(parentId),
    staleTime: FIVE_MINUTES,
    placeholderData: (previous) => previous,
  })
}
