"use client"

import { Loader2 } from "lucide-react"

import {
  ListingCard,
  ListingCardSkeleton,
} from "@/components/listings/listing-card"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { useListingSearch } from "@/features/listings/hooks"
import type { ListingFilters } from "@/features/listings/filters"

export function ListingGrid({
  filters,
  onClear,
}: {
  filters: ListingFilters
  onClear?: () => void
}) {
  const query = useListingSearch(filters)
  const items = query.data?.pages.flatMap((page) => page.items) ?? []

  if (query.isPending) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (query.isError)
    return <RetryState label="listings" onRetry={() => query.refetch()} />

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-card px-6 py-14 text-center shadow-md">
        <p className="text-lg font-semibold">No properties match your search</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try a different location or loosen a filter.
        </p>
        {onClear ? (
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            priority={index < 3}
          />
        ))}
      </div>
      {query.hasNextPage ? (
        <Button
          variant="outline"
          size="lg"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Load more
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          You&apos;ve seen every match.
        </p>
      )}
    </div>
  )
}
