import { ListingEditor } from "@/components/lister/listing-editor"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ListingEditor id={id} />
}
