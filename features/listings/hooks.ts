"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"

import { listingsApi } from "@/lib/api/listings"
import { queryKeys } from "@/lib/query/keys"
import type { ListingFilters } from "./filters"

export function useListingSearch(filters: ListingFilters, limit = 12) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings.search(filters),
    queryFn: ({ pageParam }) => listingsApi.search(filters, pageParam, limit),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => listingsApi.get(id),
    staleTime: 60_000,
  })
}
