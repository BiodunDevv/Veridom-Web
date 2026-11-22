import { apiRequest } from "@/lib/api/client"
import type { ApiSuccess } from "@/lib/api/types"
import type { Deal, Inspection } from "@/lib/api/deals"

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "PAUSED"
  | "CLOSED"
  | "SUSPENDED"

export type FeeInput = {
  feeType:
    | "CAUTION_DEPOSIT"
    | "SERVICE_CHARGE"
    | "LEGAL_FEE"
    | "AGREEMENT_FEE"
    | "OTHER"
  amountKobo: number
  frequency: "FIRST_PAYMENT" | "RECURRING"
  refundable?: boolean
}

/** Fields accepted by create and update; money is kobo. */
export type ListingInput = {
  listingType?: "RENT" | "SALE"
  title?: string
  description?: string
  propertyTypeId?: string
  priceKobo?: number
  rentPeriod?: "YEAR" | "MONTH"
  bedrooms?: number
  bathrooms?: number
  toilets?: number
  sizeSqm?: number
  furnishing?: "UNFURNISHED" | "SEMI_FURNISHED" | "FURNISHED"
  stateId?: string
  lgaId?: string
  areaId?: string
  addressLine?: string
  latitude?: number
  longitude?: number
  fees?: FeeInput[]
  amenityIds?: string[]
  assignedTo?: string | null
}

export type ListerListing = ListingInput & {
  id: string
  title: string
  status: ListingStatus
  moveInTotalKobo?: number | null
  renewalKobo?: number | null
  updatedAt?: string
  latestReview?: { reason?: string | null } | null
  fees?: FeeInput[]
  amenityIds?: string[]
}

export type PhotoStatus = "PENDING_UPLOAD" | "PROCESSING" | "READY" | "REJECTED"
export type Photo = {
  id: string
  status: PhotoStatus
  rejectReason?: string | null
  isCover: boolean
  sortOrder: number
  variants: { width: number; url: string }[]
}
export type DocStatus =
  | "PENDING_UPLOAD"
  | "SCANNING"
  | "READY"
  | "REJECTED"
  | "PURGED"
export type ProofDoc = {
  id: string
  label: string
  fileName: string
  status: DocStatus
  rejectReason?: string | null
}
export type Presign = {
  uploadUrl: string
  method: "PUT"
  headers: Record<string, string>
  photoId?: string
  documentId?: string
}
export type Availability = {
  slotMinutes: 45 | 60 | 90 | 120
  autoConfirm: boolean
  defaultAttendeeId?: string | null
  blackoutDates: string[]
  windows: { weekday: number; startsAt: string; endsAt: string }[]
}
export type PayoutAccount = {
  accountNumber?: string
  bankCode?: string
  accountName?: string
  status?: string
}

type Listish<T> = T[] | { items: T[] }
const unwrap = <T>(data: Listish<T>) =>
  Array.isArray(data) ? data : data.items
const get = async <T>(path: string) =>
  (await apiRequest<ApiSuccess<T>>(path)).data
const send = <T>(method: string, path: string, body?: unknown) =>
  apiRequest<ApiSuccess<T>>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => r.data)

const L = "/api/v1/lister"

export const listerApi = {
  listings: async (status: ListingStatus | "", page = 1, limit = 20) =>
    unwrap(
      await get<Listish<ListerListing>>(
        `${L}/listings?${status ? `status=${status}&` : ""}page=${page}&limit=${limit}`
      )
    ),
  listing: (id: string) => get<ListerListing>(`${L}/listings/${id}`),
  create: (body: ListingInput) =>
    send<ListerListing>("POST", `${L}/listings`, body),
  update: (id: string, body: ListingInput) =>
    send<ListerListing & { sentForReview?: boolean }>(
      "PATCH",
      `${L}/listings/${id}`,
      body
    ),
  submit: (id: string) =>
    send<ListerListing>("POST", `${L}/listings/${id}/submit`),
  pause: (id: string) =>
    send<ListerListing>("POST", `${L}/listings/${id}/pause`),
  confirmAvailable: (id: string) =>
    send<ListerListing>("POST", `${L}/listings/${id}/confirm-available`),
  close: (id: string, reason: "RENTED" | "SOLD" | "OTHER") =>
    send<ListerListing>("POST", `${L}/listings/${id}/close`, { reason }),
  remove: (id: string) => send<unknown>("DELETE", `${L}/listings/${id}`),

  photos: async (id: string) =>
    unwrap(await get<Listish<Photo>>(`${L}/listings/${id}/photos`)),
  presignPhoto: (
    id: string,
    body: { contentType: string; sizeBytes: number }
  ) => send<Presign>("POST", `${L}/listings/${id}/photos/presign`, body),
  confirmPhoto: (id: string, photoId: string) =>
    send<unknown>("POST", `${L}/listings/${id}/photos/${photoId}/confirm`),
  orderPhotos: (id: string, photoIds: string[]) =>
    send<unknown>("PUT", `${L}/listings/${id}/photos/order`, { photoIds }),
  removePhoto: (id: string, photoId: string) =>
    send<unknown>("DELETE", `${L}/listings/${id}/photos/${photoId}`),

  documents: async (id: string) =>
    unwrap(await get<Listish<ProofDoc>>(`${L}/listings/${id}/documents`)),
  presignDocument: (
    id: string,
    body: {
      label: string
      fileName: string
      contentType: string
      sizeBytes: number
    }
  ) => send<Presign>("POST", `${L}/listings/${id}/documents/presign`, body),
  confirmDocument: (id: string, documentId: string) =>
    send<unknown>(
      "POST",
      `${L}/listings/${id}/documents/${documentId}/confirm`
    ),
  removeDocument: (id: string, documentId: string) =>
    send<unknown>("DELETE", `${L}/listings/${id}/documents/${documentId}`),

  inspections: async () =>
    unwrap(await get<Listish<Inspection>>(`${L}/inspections`)),
  acceptInspection: (id: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/accept`, {}),
  declineInspection: (id: string, reason: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/decline`, { reason }),
  inspection: (id: string) => get<Inspection>(`${L}/inspections/${id}`),
  proposeInspection: (id: string, startsAt: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/propose`, { startsAt }),
  cancelInspection: (id: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/cancel`, {}),
  rescheduleInspection: (id: string, startsAt: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/reschedule`, { startsAt }),
  respondRescheduleInspection: (id: string, accept: boolean) =>
    send<Inspection>("POST", `${L}/inspections/${id}/respond-reschedule`, {
      accept,
    }),
  reassignInspection: (id: string, attendeeId: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/reassign`, { attendeeId }),
  checkInInspection: (id: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/check-in`, {}),
  reportNoShowInspection: (id: string) =>
    send<Inspection>("POST", `${L}/inspections/${id}/report-no-show`, {}),
  extendInspection: (id: string, minutes: number) =>
    send<Inspection>("POST", `${L}/inspections/${id}/extend`, { minutes }),
  completeInspection: (
    id: string,
    body: { customerAttended: boolean; note?: string }
  ) => send<Inspection>("POST", `${L}/inspections/${id}/complete`, body),
  availability: (id: string) =>
    get<Availability | null>(`${L}/listings/${id}/availability`),
  saveAvailability: (id: string, body: Availability) =>
    send<Availability>("PUT", `${L}/listings/${id}/availability`, body),
  deal: (id: string) =>
    get<Deal & { transfer?: { status: string; amountKobo?: number } | null }>(
      `${L}/deals/${id}`
    ),
  deals: async () => unwrap(await get<Listish<Deal>>(`${L}/deals`)),
  handoverCode: (id: string) =>
    send<{ code: string; expiresAt: string }>(
      "POST",
      `${L}/deals/${id}/handover-code`
    ),
  payoutAccount: () => get<PayoutAccount | null>(`${L}/payout-account`),
  savePayoutAccount: (body: { accountNumber: string; bankCode: string }) =>
    send<PayoutAccount>("PUT", `${L}/payout-account`, body),
}

/** Uploads straight to storage with exactly the headers the API signed; no cookies. */
export async function putToStorage(presign: Presign, file: File) {
  const response = await fetch(presign.uploadUrl, {
    method: presign.method,
    headers: presign.headers,
    body: file,
    credentials: "omit",
  })
  if (!response.ok) throw new Error("The upload was refused. Please try again.")
}
