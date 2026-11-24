import { apiRequest } from "@/lib/api/client"
import { normalizeDeal, normalizeInspection } from "@/lib/api/normalize"
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
  kind?: "INITIAL" | "RENEWAL"
  listingId?: string
  moveInDate?: string
  holdExpiresAt?: string | null
  payKobo?: number
  totalKobo?: number
  commissionCustomerKobo?: number
  commissionListerKobo?: number
  /** What the lister receives: total minus their half of the commission. */
  listerAmountKobo?: number
  createdAt?: string
  listing?: { id?: string; title?: string } | null
  /** Flat fields as the API sends them; normalised into `listing`. */
  listingTitle?: string
  organizationName?: string
  tenancyStart?: string
  tenancyEnd?: string
  rentPeriod?: "YEAR" | "MONTH"
  payment?: {
    status?: string
    authorizationUrl?: string | null
    channel?: string | null
  } | null
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
  listingTitle?: string
  /** Null until the viewing is confirmed. */
  addressLine?: string | null
  attendee?: { id?: string; firstName?: string } | null
  customerFirstName?: string
  customerEmail?: string | null
  customerCheckedIn?: boolean
  attendeeCheckedIn?: boolean
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
    unwrap(
      (await apiRequest<ApiSuccess<Listish<Deal>>>("/api/v1/deals")).data
    ).map(normalizeDeal),
  get: async (id: string) =>
    normalizeDeal(
      (await apiRequest<ApiSuccess<Deal>>(`/api/v1/deals/${id}`)).data
    ),
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
    ).map(normalizeInspection),
  /**
   * `from` / `to` are Lagos calendar days (YYYY-MM-DD). The API wants full ISO
   * datetimes with an offset, and only serves times from 3 hours to 14 days
   * ahead, so each bound is turned into an instant and kept inside that window.
   */
  slots: async (listingId: string, from: string, to: string) => {
    const HOUR = 3_600_000
    const now = Date.now()
    const earliest = now + 3 * HOUR + 60_000
    const latest = now + 14 * 24 * HOUR - 60_000
    // Lagos is UTC+1 all year (no daylight saving).
    const start = Math.min(
      Math.max(Date.parse(`${from}T00:00:00+01:00`), earliest),
      latest
    )
    const end = Math.min(
      Math.max(Date.parse(`${to}T23:59:59+01:00`), start),
      latest
    )
    const query = new URLSearchParams({
      from: new Date(start).toISOString(),
      to: new Date(end).toISOString(),
    })
    const data = (
      await apiRequest<ApiSuccess<Listish<Slot | string>>>(
        `/api/v1/listings/${listingId}/slots?${query}`
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
    normalizeInspection(
      (await apiRequest<ApiSuccess<Inspection>>(`/api/v1/inspections/${id}`))
        .data
    ),
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
