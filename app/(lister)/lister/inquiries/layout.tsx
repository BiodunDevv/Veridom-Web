import { MessagesShell } from "@/components/chat/messages-shell"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MessagesShell side="lister">{children}</MessagesShell>
}
