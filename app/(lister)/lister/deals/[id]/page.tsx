import { ListerDealDetailPage } from "@/components/lister/deal-detail-page"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ListerDealDetailPage id={id} />
}
