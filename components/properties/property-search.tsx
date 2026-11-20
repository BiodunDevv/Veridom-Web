"use client"

import { IconMask } from "@/components/landing/icon-mask"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormSelect } from "@/components/site/form-select"

const filters = [
  { label: "Location", icon: "/properties/icon-location.svg", options: ["Lagos", "Abuja", "Port Harcourt", "Ibadan"] },
  { label: "Property Type", icon: "/properties/icon-type.svg", options: ["Villa", "Apartment", "Townhouse", "Cottage"] },
  { label: "Pricing Range", icon: "/properties/icon-price.svg", options: ["Under $300k", "$300k – $700k", "$700k – $1.5M", "$1.5M+"] },
  { label: "Property Size", icon: "/properties/icon-size.svg", options: ["Under 1,000 sq ft", "1,000 – 2,500 sq ft", "2,500+ sq ft"] },
  { label: "Build Year", icon: "/properties/icon-calendar.svg", options: ["2020 – now", "2010 – 2019", "2000 – 2009", "Before 2000"] },
]

export function PropertySearch() {
  return (
    <div className="relative z-10 mx-auto -mt-8 flex max-w-[1280px] flex-col gap-3 px-4 sm:px-8 lg:-mt-12 lg:px-12">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-t-xl bg-card p-3 shadow-xl sm:p-4 lg:px-5"
      >
        <Input
          type="search"
          placeholder="Search For A Property"
          aria-label="Search for a property"
          className="h-11 flex-1 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0 lg:text-lg"
        />
        <Button type="submit" size="lg" className="shrink-0">
          <IconMask src="/properties/icon-search.svg" className="size-5" />
          <span className="hidden sm:inline">Find Property</span>
        </Button>
      </form>

      <div className="grid gap-2.5 rounded-xl bg-secondary p-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {filters.map((filter) => (
          <FormSelect
            key={filter.label}
            aria-label={filter.label}
            placeholder={filter.label}
            options={filter.options}
            icon={filter.icon}
            className="bg-card"
          />
        ))}
      </div>
    </div>
  )
}
