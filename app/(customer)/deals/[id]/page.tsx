import { Suspense } from "react"
import type { Metadata } from "next"

import { PaymentReturnPage } from "@/components/account/payment-return-page"

export const metadata: Metadata = {
  title: "Payment | Veridom",
  robots: { index: false },
}

/**
 * Paystack sends people back here after paying: /deals/:id?reference=...
 * The page confirms the payment with the server, then hands over to the deal.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="min-h-[60svh]" />}>
      <PaymentReturnPage id={id} />
    </Suspense>
  )
}
