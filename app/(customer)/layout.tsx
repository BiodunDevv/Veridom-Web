import type { Metadata } from "next"

import { AccountGate } from "@/components/account/account-gate"

export const metadata: Metadata = {
  title: "My Account | Veridom",
  description: "Manage your deals, viewings and security on Veridom.",
  robots: { index: false },
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <AccountGate>{children}</AccountGate>
}
