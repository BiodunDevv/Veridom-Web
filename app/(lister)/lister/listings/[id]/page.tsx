import { Suspense } from "react"

import { ListingEditor } from "@/components/lister/listing-editor"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // The editor reads ?confirm=available from the URL.
  return (
    <Suspense fallback={null}>
      <ListingEditor id={id} />
    </Suspense>
  )
}
