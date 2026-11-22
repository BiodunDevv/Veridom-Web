"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  listerApi,
  putToStorage,
  type ListingInput,
  type ListingStatus,
  type Photo,
  type ProofDoc,
} from "@/lib/api/lister"
import { queryKeys } from "@/lib/query/keys"
import { useAction } from "@/lib/query/use-action"

export const useListerListings = (status: ListingStatus | "", page: number) =>
  useQuery({
    queryKey: queryKeys.lister.listings(status, page),
    queryFn: () => listerApi.listings(status, page),
    placeholderData: keepPreviousData,
  })

export const useListerListing = (id?: string) =>
  useQuery({
    queryKey: queryKeys.lister.listing(id ?? ""),
    queryFn: () => listerApi.listing(id!),
    enabled: Boolean(id),
  })

const refresh = (id: string) => [
  queryKeys.lister.listing(id),
  ["lister", "listings"],
]

export const useCreateListing = (onDone: (id: string) => void) =>
  useAction(listerApi.create, {
    success: "Draft saved.",
    invalidate: [["lister", "listings"]],
    onSuccess: (listing) => onDone(listing.id),
  })

export const useUpdateListing = (id: string) =>
  useAction((body: ListingInput) => listerApi.update(id, body), {
    invalidate: refresh(id),
  })

export const useSubmitListing = (id: string) =>
  useAction(() => listerApi.submit(id), {
    success: "Submitted for review.",
    invalidate: refresh(id),
  })

export const useListingStatusAction = (id: string) => ({
  pause: useAction(() => listerApi.pause(id), {
    success: "Listing paused.",
    invalidate: refresh(id),
  }),
  confirm: useAction(() => listerApi.confirmAvailable(id), {
    success: "Listing is live again.",
    invalidate: refresh(id),
  }),
  close: useAction(
    (reason: "RENTED" | "SOLD" | "OTHER") => listerApi.close(id, reason),
    { success: "Listing closed.", invalidate: refresh(id) }
  ),
})

export const useDeleteListing = (id: string, onDone: () => void) =>
  useAction(() => listerApi.remove(id), {
    success: "Listing deleted.",
    invalidate: [["lister", "listings"]],
    onSuccess: onDone,
  })

const processing = (items?: { status: string }[]) =>
  items?.some((item) =>
    ["PENDING_UPLOAD", "PROCESSING", "SCANNING"].includes(item.status)
  )

/** Polls every 2s while anything is still being checked. */
export const usePhotos = (id?: string) =>
  useQuery({
    queryKey: queryKeys.lister.photos(id ?? ""),
    queryFn: () => listerApi.photos(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => (processing(query.state.data) ? 2000 : false),
  })

export const useDocuments = (id?: string) =>
  useQuery({
    queryKey: queryKeys.lister.documents(id ?? ""),
    queryFn: () => listerApi.documents(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => (processing(query.state.data) ? 2000 : false),
  })

export const useUploadPhoto = (id: string) =>
  useAction(
    async (file: File) => {
      const presign = await listerApi.presignPhoto(id, {
        contentType: file.type,
        sizeBytes: file.size,
      })
      await putToStorage(presign, file)
      await listerApi.confirmPhoto(id, presign.photoId!)
    },
    {
      invalidate: [queryKeys.lister.photos(id), queryKeys.lister.listing(id)],
      fallbackError: "That photo couldn't be uploaded.",
    }
  )

export const useOrderPhotos = (id: string) =>
  useAction((photoIds: string[]) => listerApi.orderPhotos(id, photoIds), {
    invalidate: [queryKeys.lister.photos(id)],
  })

export const useRemovePhoto = (id: string) =>
  useAction((photoId: string) => listerApi.removePhoto(id, photoId), {
    invalidate: [queryKeys.lister.photos(id), queryKeys.lister.listing(id)],
  })

export const useUploadDocument = (id: string) =>
  useAction(
    async ({ file, label }: { file: File; label: string }) => {
      const presign = await listerApi.presignDocument(id, {
        label,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      })
      await putToStorage(presign, file)
      await listerApi.confirmDocument(id, presign.documentId!)
    },
    {
      success: "Document uploaded. It's being checked.",
      invalidate: [queryKeys.lister.documents(id)],
    }
  )

export const useRemoveDocument = (id: string) =>
  useAction((documentId: string) => listerApi.removeDocument(id, documentId), {
    invalidate: [queryKeys.lister.documents(id)],
  })

export type { Photo, ProofDoc }
