"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { DocumentsManager } from "@/components/lister/documents-manager"
import {
  ListingForm,
  toDraft,
  toInput,
  type Draft,
} from "@/components/lister/listing-form"
import { PhotosManager } from "@/components/lister/photos-manager"
import { RetryState } from "@/components/retry-state"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useCreateListing,
  useDeleteListing,
  useListerListing,
  useListingStatusAction,
  useSubmitListing,
  useUpdateListing,
} from "@/features/lister/listing-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import { type ListerListing } from "@/lib/api/lister"
import { formatNaira } from "@/lib/format"

const LOCKED = ["PENDING_REVIEW", "SUSPENDED", "CLOSED"]

function NewListing() {
  const router = useRouter()
  const [draft, setDraft] = React.useState<Draft>(() => toDraft())
  const create = useCreateListing((id) =>
    router.replace(`/lister/listings/${id}`)
  )

  return (
    <>
      <BackLink />
      <PageHeader
        title="New listing"
        description="Start with the basics. You'll add photos and proof of ownership next."
      />
      <ListingForm
        isNew
        draft={draft}
        onChange={setDraft}
        saving={create.isPending}
        onSave={() => create.mutate(toInput(draft))}
      />
    </>
  )
}

const BackLink = () => (
  <Link
    href="/lister/listings"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="size-4" /> All listings
  </Link>
)

function EditListing({ listing }: { listing: ListerListing }) {
  const router = useRouter()
  const { can } = usePermissions()
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(listing))
  const update = useUpdateListing(listing.id)
  const submit = useSubmitListing(listing.id)
  const status = useListingStatusAction(listing.id)
  const remove = useDeleteListing(listing.id, () =>
    router.replace("/lister/listings")
  )

  const locked = LOCKED.includes(listing.status)
  const editable = ["DRAFT", "REJECTED"].includes(listing.status)
  const canClose = can("listing:close")
  const canMedia = can("media:manage")

  const save = () =>
    update.mutate(toInput(draft), {
      onSuccess: (saved) => {
        toast.success(
          saved.sentForReview
            ? "Saved. Because you changed key details, it's back in review."
            : "Changes saved."
        )
      },
    })

  return (
    <>
      <BackLink />
      <PageHeader
        title={listing.title}
        description={
          listing.moveInTotalKobo
            ? `Move-in total ${formatNaira(listing.moveInTotalKobo)} · renewal ${formatNaira(listing.renewalKobo)}`
            : undefined
        }
        actions={
          <>
            <StatusBadge status={listing.status} />
            {editable ? (
              <Button
                disabled={submit.isPending}
                onClick={() => submit.mutate()}
              >
                {submit.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send />
                )}
                Submit for review
              </Button>
            ) : null}
            {listing.status === "PUBLISHED" && canClose ? (
              <Button
                variant="outline"
                disabled={status.pause.isPending}
                onClick={() => status.pause.mutate()}
              >
                Pause
              </Button>
            ) : null}
            {listing.status === "PAUSED" && canClose ? (
              <Button
                disabled={status.confirm.isPending}
                onClick={() => status.confirm.mutate()}
              >
                Still available
              </Button>
            ) : null}
            {["PUBLISHED", "PAUSED"].includes(listing.status) && canClose ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Close listing</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => status.close.mutate("RENTED")}
                  >
                    Mark as rented
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => status.close.mutate("SOLD")}
                  >
                    Mark as sold
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => status.close.mutate("OTHER")}
                  >
                    Close for another reason
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {editable ? (
              <Button
                variant="ghost"
                disabled={remove.isPending}
                onClick={() => remove.mutate()}
              >
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      {listing.status === "REJECTED" && listing.latestReview?.reason ? (
        <p className="rounded-xl bg-destructive/10 p-4 text-sm">
          <span className="font-semibold">Changes needed: </span>
          {listing.latestReview.reason}
        </p>
      ) : null}
      {listing.status === "PENDING_REVIEW" ? (
        <p className="rounded-xl bg-secondary p-4 text-sm">
          In review. You can edit again once the team has decided.
        </p>
      ) : null}
      {listing.status === "PUBLISHED" ? (
        <p className="rounded-xl bg-secondary p-4 text-sm">
          This listing is live. Changing the address, location, property type or
          photos sends it back to review. Price and description edits stay live.
        </p>
      ) : null}

      <ListingForm
        draft={draft}
        onChange={setDraft}
        disabled={locked}
        saving={update.isPending}
        onSave={save}
      />
      <PhotosManager listingId={listing.id} disabled={locked || !canMedia} />
      <DocumentsManager
        listingId={listing.id}
        disabled={locked || !canMedia}
        canDelete={editable && canMedia}
      />
    </>
  )
}

export function ListingEditor({ id }: { id?: string }) {
  const query = useListerListing(id)

  if (!id) return <NewListing />
  if (query.isPending)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading listing…
      </p>
    )
  if (!query.data)
    return <RetryState label="this listing" onRetry={() => query.refetch()} />
  return <EditListing key={query.data.id} listing={query.data} />
}
