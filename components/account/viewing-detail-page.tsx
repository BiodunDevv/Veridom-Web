"use client"

import { Loader2 } from "lucide-react"

import { RetryState } from "@/components/retry-state"
import { EvidencePhotos } from "@/components/viewings/evidence-photos"
import { InspectionActions } from "@/components/viewings/inspection-actions"
import { ViewingSummary } from "@/components/viewings/viewing-summary"
import { useInspection } from "@/features/deals/hooks"

export function ViewingDetailPage({ id }: { id: string }) {
  const query = useInspection(id)
  const viewing = query.data

  if (query.isPending)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </p>
    )
  if (!viewing)
    return <RetryState label="this viewing" onRetry={() => query.refetch()} />

  return (
    <>
      <ViewingSummary
        inspection={viewing}
        backHref="/account/viewings"
        actions={<InspectionActions inspection={viewing} side="customer" />}
      />
      <EvidencePhotos inspectionId={id} />
    </>
  )
}
