"use client"

import Link from "next/link"
import { BuildingIcon, Plus } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { Button } from "@/components/ui/button"
import { useListerListings } from "@/features/lister/listing-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import { formatNaira } from "@/lib/format"

export function ListerOverviewPage() {
  const { org, can } = usePermissions()
  const recent = useListerListings("", 1).data?.slice(0, 5) ?? []
  const canList = can(
    "listing:create",
    "listing:update:any",
    "listing:update:assigned",
    "listing:close",
    "media:manage"
  )

  return (
    <>
      <PageHeader
        title={org?.name ?? "Lister"}
        description="Your listings, viewings and payouts in one place."
        actions={
          can("listing:create") ? (
            <Button asChild>
              <Link href="/lister/listings/new">
                <Plus /> New listing
              </Link>
            </Button>
          ) : null
        }
      />
      {canList ? (
        <section className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BuildingIcon className="size-5" /> Latest listings
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No listings yet.
              {can("listing:create")
                ? " Create your first one to get started."
                : ""}
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/lister/listings/${listing.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                  >
                    <span className="min-w-0 truncate font-medium">
                      {listing.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatNaira(listing.priceKobo)}
                      </span>
                      <StatusBadge status={listing.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="rounded-xl bg-card p-5 text-sm text-muted-foreground shadow-md">
          Your role doesn&apos;t include listings. Use the menu to see what you
          can do.
        </p>
      )}
    </>
  )
}
