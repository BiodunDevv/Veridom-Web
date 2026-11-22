"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { dealsApi, inspectionsApi } from "@/lib/api/deals"
import { getApiErrorMessage } from "@/lib/api/client"
import { queryKeys } from "@/lib/query/keys"

export const useDeals = () =>
  useQuery({ queryKey: queryKeys.deals, queryFn: dealsApi.list, retry: false })

/** Polls while the deal is waiting on a payment; the redirect back is never trusted. */
export const useDeal = (id: string) =>
  useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => dealsApi.get(id),
    refetchInterval: (query) =>
      query.state.data?.status === "HELD" ? 4000 : false,
    refetchOnWindowFocus: true,
  })

function useDealAction<TVars, TData>(
  id: string,
  mutationFn: (vars: TVars) => Promise<TData>,
  success: string,
  onSuccess?: (data: TData) => void
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.deals })
      await queryClient.invalidateQueries({ queryKey: queryKeys.deal(id) })
      toast.success(success)
      onSuccess?.(data)
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "That didn't work. Please try again.")
      ),
  })
}

export const useCancelDeal = (id: string) =>
  useDealAction(id, () => dealsApi.cancel(id), "Deal cancelled.")
export const useReportProblem = (id: string) =>
  useDealAction(
    id,
    (reason: string) => dealsApi.reportProblem(id, reason),
    "Problem reported. Payout is on hold."
  )
export const useConfirmMoveIn = (id: string) =>
  useDealAction(
    id,
    (code: string) => dealsApi.confirmMoveIn(id, code),
    "Move-in confirmed."
  )
export const useRefundBankDetails = (id: string, refundId: string) =>
  useDealAction(
    id,
    (body: { accountNumber: string; bankCode: string }) =>
      dealsApi.refundBankDetails(refundId, body),
    "Bank details saved."
  )

export const useCheckout = () =>
  useMutation({
    mutationFn: (id: string) => dealsApi.checkout(id),
    onSuccess: ({ authorizationUrl }) =>
      window.location.assign(authorizationUrl),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not start the payment.")),
  })

export const useInspections = () =>
  useQuery({
    queryKey: queryKeys.inspections,
    queryFn: inspectionsApi.list,
    retry: false,
  })

export const useSlots = (
  listingId: string,
  from: string,
  to: string,
  enabled: boolean
) =>
  useQuery({
    queryKey: queryKeys.listings.slots(listingId, from, to),
    queryFn: () => inspectionsApi.slots(listingId, from, to),
    enabled,
    staleTime: 30_000,
  })

export function useInspectionAction<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  success: string,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inspections })
      toast.success(success)
      onSuccess?.()
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "That didn't work. Please try again.")
      ),
  })
}

export const useInspection = (id: string) =>
  useQuery({
    queryKey: queryKeys.inspection(id),
    queryFn: () => inspectionsApi.get(id),
    retry: false,
  })
