import { AvailabilityPage } from "@/components/lister/availability-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AvailabilityPage id={id} />
}
