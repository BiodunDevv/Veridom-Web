import { ChatThread } from "@/components/chat/thread"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ChatThread key={id} side="lister" id={id} />
}
