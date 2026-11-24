"use client"

import { RetryState } from "@/components/retry-state"
import { InspectionActions } from "@/components/viewings/inspection-actions"
import { ViewingSummary } from "@/components/viewings/viewing-summary"
import { useListerInspection } from "@/features/lister/ops-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import { DetailSkeleton } from "@/components/ui/page-skeletons"

export function ListerViewingDetailPage({ id }: { id: string }) {
  const query = useListerInspection(id)
  const { can } = usePermissions()
  const viewing = query.data

  if (query.isPending) return <DetailSkeleton />
  if (!viewing)
    return <RetryState label="this viewing" onRetry={() => query.refetch()} />

  return (
    <ViewingSummary
      inspection={viewing}
      backHref="/lister/viewings"
      side="lister"
      actions={
        can("inspection:manage") ? (
          <InspectionActions inspection={viewing} side="lister" />
        ) : null
      }
    />
  )
}
