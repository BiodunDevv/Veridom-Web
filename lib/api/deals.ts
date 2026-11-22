import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"

export type DealStatus =
  | "HELD"
  | "PAID"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "REFUND_DUE"
  | "REFUNDED"
  | "DISPUTED"

export type Deal = {
  id: string
  status: DealStatus
  kind?: "RESERVATION" | "RENEWAL"
  listingId?: string
  moveInDate?: string
  holdExpiresAt?: string | null
  payKobo?: number
  totalKobo?: number
  commissionCustomerKobo?: number
  createdAt?: string
  listing?: { id?: string; title?: string } | null
  payment?: { status?: string } | null
  refund?: { id: string; status: string } | null
}

export type Slot = { startsAt: string; endsAt?: string }

export type Inspection = {
  id: string
  status: string
  startsAt?: string
  endsAt?: string
  listingId?: string
  proposedStartsAt?: string | null
  listing?: { id?: string; title?: string; addressLine?: string } | null
  attendee?: { id?: string; firstName?: string } | null
}

export type EvidencePhoto = { id: string; url?: string; status?: string }
export type InspectionOutcome = "PROCEED" | "NOT_INTERESTED" | "NEED_MORE_TIME"

type Listish<T> = T[] | { items: T[] }
const unwrap = <T>(data: Listish<T>) =>
  Array.isArray(data) ? data : data.items

const post = <T>(
  path: string,
  body: unknown = {},
  headers?: Record<string, string>
) =>
  apiRequest<ApiSuccess<T>>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  }).then((r) => r.data)

export const dealsApi = {
  list: async () =>
    unwrap((await apiRequest<ApiSuccess<Listish<Deal>>>("/api/v1/deals")).data),
  get: async (id: string) =>
    (await apiRequest<ApiSuccess<Deal>>(`/api/v1/deals/${id}`)).data,
  reserve: (
    listingId: string,
    body: { moveInDate: string; acknowledgeNoInspection?: boolean },
    idempotencyKey: string
  ) =>
    post<Deal>(`/api/v1/listings/${listingId}/deals`, body, {
      "Idempotency-Key": idempotencyKey,
    }),
  checkout: (id: string) =>
    post<{ paymentId: string; authorizationUrl: string; amountKobo: number }>(
      `/api/v1/deals/${id}/checkout`
    ),
  cancel: (id: string) => post<Deal>(`/api/v1/deals/${id}/cancel`),
  reportProblem: (id: string, reason: string) =>
    post<Deal>(`/api/v1/deals/${id}/report-problem`, { reason }),
  confirmMoveIn: (id: string, code: string) =>
    post<Deal>(`/api/v1/deals/${id}/confirm-move-in`, { code }),
  renew: (id: string, idempotencyKey: string) =>
    post<Deal>(
      `/api/v1/deals/${id}/renew`,
      {},
      { "Idempotency-Key": idempotencyKey }
    ),
  refundBankDetails: (
    refundId: string,
    body: { accountNumber: string; bankCode: string }
  ) => post<unknown>(`/api/v1/refunds/${refundId}/bank-details`, body),
}

export const inspectionsApi = {
  list: async () =>
    unwrap(
      (await apiRequest<ApiSuccess<Listish<Inspection>>>("/api/v1/inspections"))
        .data
    ),
  slots: async (listingId: string, from: string, to: string) => {
    const data = (
      await apiRequest<ApiSuccess<Listish<Slot | string>>>(
        `/api/v1/listings/${listingId}/slots?from=${from}&to=${to}`
      )
    ).data
    return unwrap(data).map((slot) =>
      typeof slot === "string" ? { startsAt: slot } : slot
    )
  },
  request: (listingId: string, startsAt: string) =>
    post<Inspection>(`/api/v1/listings/${listingId}/inspections`, { startsAt }),
  cancel: (id: string, reason: string) =>
    post<Inspection>(`/api/v1/inspections/${id}/cancel`, { reason }),
  acceptProposal: (id: string) =>
    post<Inspection>(`/api/v1/inspections/${id}/accept-proposal`),
  get: async (id: string) =>
    (await apiRequest<ApiSuccess<Inspection>>(`/api/v1/inspections/${id}`))
      .data,
  reschedule: (id: string, startsAt: string) =>
    post<Inspection>(`/api/v1/inspections/${id}/reschedule`, { startsAt }),
  respondReschedule: (id: string, accept: boolean) =>
    post<Inspection>(`/api/v1/inspections/${id}/respond-reschedule`, {
      accept,
    }),
  checkIn: (id: string) =>
    post<Inspection>(`/api/v1/inspections/${id}/check-in`),
  extend: (id: string, minutes: number) =>
    post<Inspection>(`/api/v1/inspections/${id}/extend`, { minutes }),
  reportNoShow: (id: string) =>
    post<Inspection>(`/api/v1/inspections/${id}/report-no-show`),
  outcome: (id: string, outcome: InspectionOutcome, reason?: string) =>
    post<Inspection>(`/api/v1/inspections/${id}/outcome`, { outcome, reason }),
  photos: async (id: string) =>
    unwrap(
      (
        await apiRequest<ApiSuccess<Listish<EvidencePhoto>>>(
          `/api/v1/inspections/${id}/photos`
        )
      ).data
    ),
  presignPhoto: (
    id: string,
    body: { contentType: string; sizeBytes: number }
  ) =>
    post<{
      photoId: string
      uploadUrl: string
      method: "PUT"
      headers: Record<string, string>
    }>(`/api/v1/inspections/${id}/photos/presign`, body),
  confirmPhoto: (id: string, photoId: string) =>
    post<unknown>(`/api/v1/inspections/${id}/photos/${photoId}/confirm`),
}
