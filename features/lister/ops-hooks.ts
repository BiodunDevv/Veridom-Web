"use client"

import { useQuery } from "@tanstack/react-query"

import { listerApi, type Availability } from "@/lib/api/lister"
import { queryKeys } from "@/lib/query/keys"
import { useAction } from "@/lib/query/use-action"

export const useListerInspections = () =>
  useQuery({
    queryKey: queryKeys.lister.inspections,
    queryFn: listerApi.inspections,
    retry: false,
  })
export const useListerDeals = () =>
  useQuery({
    queryKey: queryKeys.lister.deals,
    queryFn: listerApi.deals,
    retry: false,
  })
export const usePayoutAccount = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.lister.payout,
    queryFn: listerApi.payoutAccount,
    enabled,
    retry: false,
  })

export const useAcceptInspection = () =>
  useAction(listerApi.acceptInspection, {
    success: "Viewing confirmed.",
    invalidate: [queryKeys.lister.inspections],
  })
export const useDeclineInspection = () =>
  useAction(
    ({ id, reason }: { id: string; reason: string }) =>
      listerApi.declineInspection(id, reason),
    {
      success: "Viewing declined.",
      invalidate: [queryKeys.lister.inspections],
    }
  )
export const useHandoverCode = (
  onCode: (code: { code: string; expiresAt: string }) => void
) => useAction(listerApi.handoverCode, { onSuccess: onCode })
export const useSavePayout = () =>
  useAction(listerApi.savePayoutAccount, {
    success: "Payout account saved.",
    invalidate: [queryKeys.lister.payout],
  })

export const useListerInspection = (id: string) =>
  useQuery({
    queryKey: queryKeys.lister.inspection(id),
    queryFn: () => listerApi.inspection(id),
    retry: false,
  })

export const useListerDeal = (id: string) =>
  useQuery({
    queryKey: queryKeys.lister.deal(id),
    queryFn: () => listerApi.deal(id),
    retry: false,
  })

export const useAvailability = (listingId: string) =>
  useQuery({
    queryKey: queryKeys.lister.availability(listingId),
    queryFn: () => listerApi.availability(listingId),
    retry: false,
  })

export const useSaveAvailability = (listingId: string) =>
  useAction(
    (body: Availability) => listerApi.saveAvailability(listingId, body),
    {
      success: "Viewing times saved.",
      invalidate: [queryKeys.lister.availability(listingId)],
    }
  )
