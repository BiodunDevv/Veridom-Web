import type { Metadata } from "next"

import { ListerGate } from "@/components/lister/lister-gate"

export const metadata: Metadata = {
  title: "Lister Dashboard | Veridom",
  description: "Manage listings, viewings, deals and payouts on Veridom.",
  robots: { index: false },
}

export default function ListerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ListerGate>{children}</ListerGate>
}
