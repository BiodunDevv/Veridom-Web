"use client"

import { RetryState } from "@/components/retry-state"
import { EvidencePhotos } from "@/components/viewings/evidence-photos"
import { InspectionActions } from "@/components/viewings/inspection-actions"
import { ViewingSummary } from "@/components/viewings/viewing-summary"
import { useInspection } from "@/features/deals/hooks"
import { DetailSkeleton } from "@/components/ui/page-skeletons"

export function ViewingDetailPage({ id }: { id: string }) {
  const query = useInspection(id)
  const viewing = query.data

  if (query.isPending) return <DetailSkeleton />
  if (!viewing)
    return <RetryState label="this viewing" onRetry={() => query.refetch()} />

  return (
    <>
      <ViewingSummary
        inspection={viewing}
        backHref="/account/viewings"
        side="customer"
        actions={<InspectionActions inspection={viewing} side="customer" />}
      />
      <EvidencePhotos inspectionId={id} status={viewing.status} />
    </>
  )
}
