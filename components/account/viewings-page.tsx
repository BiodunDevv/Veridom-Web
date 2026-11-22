"use client"

import { ViewingList } from "@/components/viewings/viewing-list"
import { useInspections } from "@/features/deals/hooks"

export function ViewingsPage() {
  return (
    <ViewingList
      query={useInspections()}
      title="Viewings"
      description="Property viewings you've requested. Times are shown in Lagos time."
      basePath="/account/viewings"
      emptyTitle="No viewings booked"
      emptyHint="Request a viewing from any listing. The exact address is shared once the lister confirms."
      cta={{ href: "/properties", label: "Find a property" }}
    />
  )
}
