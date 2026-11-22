import { ListerViewingDetailPage } from "@/components/lister/viewing-detail-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ListerViewingDetailPage id={id} />
}
