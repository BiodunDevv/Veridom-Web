import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Banner with a title and a row of stat tiles, matching the lister/account headers. */
export function HeroSkeleton({ stats = 4 }: { stats?: number }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-md sm:p-6">
      <div className="flex items-start gap-3.5">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2 pt-0.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-48 max-w-[70%]" />
          <Skeleton className="h-3.5 w-72 max-w-[90%]" />
        </div>
      </div>
      {stats ? (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {Array.from({ length: stats }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border p-3.5"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-20 opacity-60" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Compact list rows: a tile, two lines and a pill. */
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-2.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-md"
        >
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4 opacity-60" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </li>
      ))}
    </ul>
  )
}

/** Photo cards in a grid. */
export function CardsSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <ul
      className="grid gap-4 min-[560px]:grid-cols-2 xl:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: cards }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl bg-card shadow-md">
          <Skeleton className="aspect-[3/2] w-full rounded-none" />
          <div className="flex flex-col gap-2.5 p-4">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2 opacity-60" />
            <Skeleton className="mt-2 h-5 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** A card of labelled fields. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div
      className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-md sm:p-6"
      aria-hidden
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-56 max-w-full opacity-60" />
      </div>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/** A detail page: back link, banner, then a main column and a side column. */
export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Loading">
      <Skeleton className="h-4 w-24" />
      <HeroSkeleton />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <FormSkeleton fields={3} />
        <div className="hidden flex-col gap-3 rounded-2xl bg-card p-5 shadow-md lg:flex">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20 opacity-60" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full opacity-70" />
          ))}
        </div>
      </div>
    </div>
  )
}

/** The signed-in app shell while the session loads: no spinner, just the shape of the page. */
export function ShellSkeleton({
  label = "Loading",
  variant = "app",
}: {
  label?: string
  /** "site" is the public header with a profile layout; "app" is the sidebar dashboard. */
  variant?: "app" | "site"
}) {
  if (variant === "site")
    return (
      <div
        className="min-h-svh bg-background"
        role="status"
        aria-busy
        aria-label={label}
      >
        <div className="flex h-14 items-center justify-between gap-4 border-b px-4 sm:px-8 lg:h-16 lg:px-12">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
        <div className="mx-auto grid max-w-[1280px] gap-5 px-4 py-6 sm:px-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-12">
          <div className="hidden flex-col gap-2 lg:flex">
            <Skeleton className="h-16 w-full rounded-2xl" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <HeroSkeleton stats={0} />
            <RowsSkeleton rows={3} />
          </div>
        </div>
      </div>
    )
  return (
    <div
      className="flex min-h-svh bg-background"
      role="status"
      aria-busy
      aria-label={label}
    >
      <aside className="hidden w-64 shrink-0 flex-col gap-6 p-4 md:flex">
        <div className="flex items-center gap-2.5 px-1">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-9 w-full rounded-lg", i === 0 && "opacity-90")}
            />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
        <div className="flex flex-1 flex-col overflow-hidden bg-card/40 md:rounded-2xl md:border">
          <div className="flex h-14 items-center justify-between gap-3 border-b px-4 md:px-6">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <HeroSkeleton />
            <RowsSkeleton rows={3} />
          </div>
        </div>
      </div>
    </div>
  )
}
