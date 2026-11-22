"use client"

import { ViewingList } from "@/components/viewings/viewing-list"
import { useListerInspections } from "@/features/lister/ops-hooks"

export function ListerViewingsPage() {
  return (
    <ViewingList
      query={useListerInspections()}
      title="Viewings"
      description="Requests from customers. Times are shown in Lagos time."
      basePath="/lister/viewings"
      emptyTitle="No viewing requests yet"
      emptyHint="When a customer asks to view one of your listings it appears here."
    />
  )
}
