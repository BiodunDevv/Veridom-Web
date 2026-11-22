"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ListingFilterBar } from "@/components/listings/listing-filters"
import { ListingGrid } from "@/components/listings/listing-grid"
import { cn } from "@/lib/utils"
import { Section } from "@/components/landing/section"
import {
  parseFilters,
  toSearchParams,
  type ListingFilters,
} from "@/features/listings/filters"

/** Filters live in the URL, so every search can be shared and the back button works. */
export function ListingSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = React.useMemo(
    () => parseFilters(searchParams),
    [searchParams]
  )

  const update = React.useCallback(
    (next: ListingFilters) => {
      const query = toSearchParams(next).toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router]
  )

  return (
    <>
      <div className="relative z-10 mx-auto -mt-8 w-full max-w-[1280px] px-4 sm:px-8 lg:-mt-12 lg:px-12">
        <ListingFilterBar filters={filters} onChange={update} />
      </div>
      <Section id="results" className="pt-8 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Available homes
          </h2>
          <div
            role="group"
            aria-label="Listing type"
            className="inline-flex rounded-full bg-muted p-1"
          >
            {[
              { label: "All", value: undefined },
              { label: "For rent", value: "RENT" as const },
              { label: "For sale", value: "SALE" as const },
            ].map((tab) => {
              const on = filters.listingType === tab.value
              return (
                <button
                  key={tab.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ ...filters, listingType: tab.value })}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    on
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
        <ListingGrid
          filters={filters}
          hasFilters={Object.values(filters).some(
            (value) =>
              value !== undefined &&
              value !== "" &&
              !(Array.isArray(value) && value.length === 0)
          )}
          onClear={() => update({})}
        />
      </Section>
    </>
  )
}
