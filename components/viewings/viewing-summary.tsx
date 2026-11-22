import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import type { Inspection } from "@/lib/api/deals"
import { formatDate } from "@/lib/format"

export function ViewingSummary({
  inspection,
  backHref,
  actions,
}: {
  inspection: Inspection
  backHref: string
  actions?: React.ReactNode
}) {
  return (
    <>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All viewings
      </Link>
      <PageHeader
        title={inspection.listing?.title ?? "Property viewing"}
        description={formatDate(inspection.startsAt)}
        actions={
          <>
            <StatusBadge status={inspection.status} />
            {actions}
          </>
        }
      />
      <section className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md sm:p-6">
        <h2 className="text-lg font-semibold">Details</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">When</dt>
            <dd className="font-medium">{formatDate(inspection.startsAt)}</dd>
          </div>
          {inspection.proposedStartsAt ? (
            <div>
              <dt className="text-muted-foreground">Proposed new time</dt>
              <dd className="font-medium">
                {formatDate(inspection.proposedStartsAt)}
              </dd>
            </div>
          ) : null}
          {inspection.listing?.addressLine ? (
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{inspection.listing.addressLine}</dd>
            </div>
          ) : null}
          {inspection.attendee?.firstName ? (
            <div>
              <dt className="text-muted-foreground">You&apos;ll meet</dt>
              <dd className="font-medium">{inspection.attendee.firstName}</dd>
            </div>
          ) : null}
        </dl>
        {!inspection.listing?.addressLine ? (
          <p className="text-xs text-muted-foreground">
            The exact address and the attendee&apos;s name appear once the
            viewing is confirmed.
          </p>
        ) : null}
      </section>
    </>
  )
}
