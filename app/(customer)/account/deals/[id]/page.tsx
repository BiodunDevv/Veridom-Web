import { DealDetailPage } from "@/components/account/deal-detail-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DealDetailPage id={id} />
}
