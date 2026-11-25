"use client"

import * as React from "react"
import Link from "next/link"

import {
  ListingCard,
  ListingCardSkeleton,
} from "@/components/listings/listing-card"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { Illustration } from "@/components/ui/illustration"
import { useListingSearch } from "@/features/listings/hooks"
import type { ListingFilters } from "@/features/listings/filters"

export function ListingGrid({
  filters,
  hasFilters,
  onClear,
}: {
  filters: ListingFilters
  hasFilters?: boolean
  onClear?: () => void
}) {
  const query = useListingSearch(filters)
  const items = query.data?.pages.flatMap((page) => page.items) ?? []
  const sentinel = React.useRef<HTMLDivElement>(null)
  const {
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = query

  // Load the next page on its own when the visitor nears the bottom.
  React.useEffect(() => {
    const el = sentinel.current
    if (!el || !hasNextPage || isFetchNextPageError) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) void fetchNextPage()
      },
      { rootMargin: "800px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage])

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
      <div className="relative overflow-hidden rounded-2xl bg-card px-6 py-10 text-center shadow-md sm:py-12">
        <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
          <Illustration name={hasFilters ? "search" : "listings"} size="lg" />
          <div className="flex flex-col gap-1.5">
            <p className="text-xl font-semibold tracking-tight">
              {hasFilters
                ? "No properties match your search"
                : "New homes are on their way"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Try a different location, widen your price range or remove a filter."
                : "Every listing is reviewed before it goes live, so new verified homes appear here as soon as they pass."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {hasFilters && onClear ? (
              <Button onClick={onClear}>Clear filters</Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/account?lister=new">List your property</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((listing, index) => (
          <div
            key={listing.id}
            className="animate-appear"
            style={
              {
                "--appear-delay": `${Math.min(index, 8) * 60}ms`,
              } as React.CSSProperties
            }
          >
            <ListingCard listing={listing} priority={index < 3} />
          </div>
        ))}
      </div>
      {isFetchingNextPage ? (
        <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : null}
      {hasNextPage ? (
        isFetchNextPageError ? (
          <Button variant="outline" size="lg" onClick={() => fetchNextPage()}>
            Couldn&apos;t load more. Try again
          </Button>
        ) : (
          <div ref={sentinel} aria-hidden className="h-px w-full" />
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          You&apos;ve seen every match.
        </p>
      )}
    </div>
  )
}
