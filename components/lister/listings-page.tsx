"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CircleCheck,
  Clock3,
  FileEdit,
  ImageIcon,
  LayoutGrid,
  Plus,
  Rows3,
  Search,
} from "lucide-react"

import { StatusBadge } from "@/components/account/status-badge"
import {
  ListerEmpty,
  ListerHero,
  ListSkeleton,
  timeAgo,
} from "@/components/lister/lister-ui"
import { ListingImage } from "@/components/listings/listing-image"
import { FormSelect } from "@/components/site/form-select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { PatternBg } from "@/components/ui/pattern-bg"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import { useListerListings, usePhotos } from "@/features/lister/listing-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import type { ListerListing, ListingStatus } from "@/lib/api/lister"
import { formatNaira } from "@/lib/format"
import { cn } from "@/lib/utils"

const tabs: { value: ListingStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "PENDING_REVIEW", label: "In review" },
  { value: "PUBLISHED", label: "Live" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
]

/** The colour rail and icon tint that say what state a listing is in. */
const rail: Record<string, string> = {
  PUBLISHED: "bg-primary",
  PENDING_REVIEW: "bg-amber-500",
  REJECTED: "bg-destructive",
  DRAFT: "bg-muted-foreground/40",
  PAUSED: "bg-sky-500",
  CLOSED: "bg-muted-foreground/25",
}

const STATUS_DOT: Record<string, string> = {
  PUBLISHED: "bg-primary",
  PENDING_REVIEW: "bg-amber-500",
  REJECTED: "bg-destructive",
  DRAFT: "bg-muted-foreground",
  PAUSED: "bg-sky-500",
  CLOSED: "bg-muted-foreground/60",
}

const statusLabel = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())

/** Cover photo from the list data, or from the photos endpoint, or a pattern tile. */
function Cover({ listing }: { listing: ListerListing }) {
  const hasCover = Boolean(listing.cover?.length)
  const photosQuery = usePhotos(hasCover ? undefined : listing.id)
  const photos = photosQuery.data
  const variants = hasCover
    ? listing.cover
    : (photos?.find((p) => p.status === "READY") ?? photos?.[0])?.variants

  return (
    <div
      className={cn(
        "relative isolate aspect-[3/2] overflow-hidden bg-secondary",
        photosQuery.isLoading && "animate-pulse"
      )}
    >
      {variants?.length ? (
        <ListingImage
          variants={variants}
          alt=""
          sizes="(min-width: 1280px) 30vw, (min-width: 560px) 45vw, 92vw"
          className="size-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <>
          <PatternBg className="-z-10 opacity-60 dark:opacity-70" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-background/80 text-primary shadow-sm backdrop-blur-sm">
              <Building2 className="size-7" aria-hidden />
            </span>
          </span>
        </>
      )}
      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
        <span
          className={cn(
            "size-1.5 rounded-full",
            STATUS_DOT[listing.status] ?? "bg-muted-foreground"
          )}
        />
        {statusLabel(listing.status)}
      </span>
    </div>
  )
}

function ListingCard({ listing }: { listing: ListerListing }) {
  const photos = usePhotos(listing.id).data
  const photoCount = photos?.filter((p) => p.status !== "REJECTED").length
  const incomplete =
    ["DRAFT", "REJECTED"].includes(listing.status) &&
    photoCount !== undefined &&
    photoCount < 3
  const facts = [
    listing.bedrooms ? `${listing.bedrooms} bed` : null,
    listing.bathrooms ? `${listing.bathrooms} bath` : null,
    listing.sizeSqm ? `${listing.sizeSqm} sqm` : null,
  ].filter(Boolean)

  return (
    <Link
      href={`/lister/listings/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-md transition-[translate,box-shadow] outline-none hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Cover listing={listing} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 leading-snug font-semibold group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {facts.length ? `${facts.join(" · ")} · ` : ""}Updated{" "}
            {timeAgo(listing.updatedAt)}
          </p>
        </div>
        {listing.status === "REJECTED" && listing.latestReview?.reason ? (
          <p className="flex items-start gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-2">{listing.latestReview.reason}</span>
          </p>
        ) : incomplete ? (
          <p className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            <ImageIcon className="size-3.5 shrink-0" aria-hidden />
            {photoCount}/3 photos added
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
          <p className="text-lg font-semibold tracking-tight tabular-nums">
            {formatNaira(listing.priceKobo)}
            {listing.rentPeriod ? (
              <span className="text-xs font-medium text-muted-foreground">
                {" "}
                / {listing.rentPeriod === "MONTH" ? "month" : "year"}
              </span>
            ) : null}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ListingRow({ listing }: { listing: ListerListing }) {
  return (
    <Link
      href={`/lister/listings/${listing.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl bg-card p-4 pl-5 shadow-md transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-xl sm:p-5 sm:pl-6"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          rail[listing.status] ?? "bg-muted"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold group-hover:text-primary">
          {listing.title}
        </p>
        <p className="text-sm text-muted-foreground">
          Updated {timeAgo(listing.updatedAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="font-semibold tabular-nums">
          {formatNaira(listing.priceKobo)}
        </span>
        <StatusBadge status={listing.status} />
      </div>
      <ArrowUpRight
        className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary sm:block"
        aria-hidden
      />
    </Link>
  )
}

export function ListerListingsPage() {
  const { can } = usePermissions()
  const [status, setStatus] = React.useState<ListingStatus | "">("")
  const [page, setPage] = React.useState(1)
  const query = useListerListings(status, page)
  const all = useListerListings("", 1)
  const items = React.useMemo(() => query.data ?? [], [query.data])
  const [term, setTerm] = React.useState("")
  const [sort, setSort] = React.useState<
    "updated" | "price-desc" | "price-asc"
  >("updated")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const visible = React.useMemo(() => {
    const q = term.trim().toLowerCase()
    const list = q
      ? items.filter((l) => l.title.toLowerCase().includes(q))
      : [...items]
    if (sort === "price-desc")
      list.sort((a, b) => (b.priceKobo ?? 0) - (a.priceKobo ?? 0))
    else if (sort === "price-asc")
      list.sort((a, b) => (a.priceKobo ?? 0) - (b.priceKobo ?? 0))
    else
      list.sort(
        (a, b) => +new Date(b.updatedAt ?? 0) - +new Date(a.updatedAt ?? 0)
      )
    return list
  }, [items, term, sort])
  const overview = all.data ?? []
  const count = (s: ListingStatus) =>
    overview.filter((l) => l.status === s).length
  const needsAttention = overview.filter((l) => l.status === "REJECTED").length

  return (
    <>
      <ListerHero
        icon={Building2}
        eyebrow="Listings"
        title="My listings"
        description="Create, review and manage what you've listed."
        loading={all.isPending}
        actions={
          can("listing:create") ? (
            <Button asChild>
              <Link href="/lister/listings/new">
                <Plus /> New listing
              </Link>
            </Button>
          ) : null
        }
        stats={[
          {
            label: "Live",
            value: count("PUBLISHED"),
            icon: CircleCheck,
            tone: "good",
            hint: "Visible to renters",
          },
          {
            label: "In review",
            value: count("PENDING_REVIEW"),
            icon: Clock3,
            tone: "warn",
            hint: "Waiting for Veridom",
          },
          {
            label: "Drafts",
            value: count("DRAFT"),
            icon: FileEdit,
            hint: "Not submitted yet",
          },
          {
            label: "Need changes",
            value: needsAttention,
            icon: Building2,
            tone: needsAttention ? "warn" : "default",
            hint: needsAttention ? "Rejected, fix and resubmit" : "All clear",
          },
        ]}
      />

      <div
        role="tablist"
        aria-label="Status"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {tabs.map((tab) => {
          const n =
            tab.value === ""
              ? overview.length
              : count(tab.value as ListingStatus)
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => {
                setStatus(tab.value)
                setPage(1)
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                status === tab.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-accent"
              )}
            >
              {tab.label}
              {overview.length && n ? (
                <span className="rounded-full bg-foreground/10 px-1.5 text-[11px] tabular-nums">
                  {n}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="h-10 rounded-xl bg-card sm:max-w-xs">
          <InputGroupAddon align="inline-start" className="pl-3">
            <Search className="size-4 text-muted-foreground" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search your listings"
            aria-label="Search your listings"
            className="h-full text-sm md:text-sm"
          />
        </InputGroup>
        <div className="flex items-center gap-2">
          <FormSelect
            aria-label="Sort"
            placeholder="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            wrapperClassName="w-44"
            className="h-10"
            options={[
              { value: "updated", label: "Newest first" },
              { value: "price-desc", label: "Highest price" },
              { value: "price-asc", label: "Lowest price" },
            ]}
          />
          <div
            role="group"
            aria-label="Layout"
            className="inline-flex rounded-xl border bg-card p-0.5"
          >
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", Rows3, "List view"],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(
                  "grid size-9 place-items-center rounded-[10px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  view === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {query.isPending ? (
        <ListSkeleton />
      ) : query.isError ? (
        <RetryState label="your listings" onRetry={() => query.refetch()} />
      ) : visible.length === 0 ? (
        <ListerEmpty
          icon={Building2}
          art={term || status ? "search" : "listerListings"}
          title={term || status ? "Nothing in this view" : "Nothing here yet"}
          hint={
            term || status
              ? "Try another search or status, or create a new listing."
              : "Listings you create appear here with their status."
          }
          action={
            can("listing:create") ? (
              <Button asChild>
                <Link href="/lister/listings/new">
                  <Plus /> Create your first listing
                </Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {view === "grid" ? (
            <ul className="grid gap-4 min-[560px]:grid-cols-2 xl:grid-cols-3">
              {visible.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {visible.map((listing) => (
                <li key={listing.id}>
                  <ListingRow listing={listing} />
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              disabled={items.length < 20}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </>
  )
}
