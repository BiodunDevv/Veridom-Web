"use client"

import { Loader2 } from "lucide-react"

import { RetryState } from "@/components/retry-state"
import { InspectionActions } from "@/components/viewings/inspection-actions"
import { ViewingSummary } from "@/components/viewings/viewing-summary"
import { useListerInspection } from "@/features/lister/ops-hooks"
import { usePermissions } from "@/features/lister/org-hooks"

export function ListerViewingDetailPage({ id }: { id: string }) {
  const query = useListerInspection(id)
  const { can } = usePermissions()
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
    <ViewingSummary
      inspection={viewing}
      backHref="/lister/viewings"
      actions={
        can("inspection:manage") ? (
          <InspectionActions inspection={viewing} side="lister" />
        ) : null
      }
    />
  )
}
