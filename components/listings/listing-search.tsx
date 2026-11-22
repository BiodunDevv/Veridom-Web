"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ListingFilterBar } from "@/components/listings/listing-filters"
import { ListingGrid } from "@/components/listings/listing-grid"
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
        <ListingGrid filters={filters} onClear={() => update({})} />
      </Section>
    </>
  )
}
