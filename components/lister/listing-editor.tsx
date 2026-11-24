"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  Clock3,
  FileCheck2,
  Images,
  Loader2,
  Radio,
  Send,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/account/page-header"
import { StatusBadge } from "@/components/account/status-badge"
import { useConfirm } from "@/components/lister/confirm-dialog"
import { ListerHero } from "@/components/lister/lister-ui"
import {
  ListingReadiness,
  type ReadinessItem,
} from "@/components/lister/listing-readiness"
import { DocumentsManager } from "@/components/lister/documents-manager"
import {
  ListingForm,
  toDraft,
  toInput,
  type Draft,
} from "@/components/lister/listing-form"
import { NewListingWizard } from "@/components/lister/new-listing-wizard"
import { PhotosManager } from "@/components/lister/photos-manager"
import { ViewingTimesCard } from "@/components/lister/viewing-times-card"
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
  useDocuments,
  useListerListing,
  usePhotos,
  useListingStatusAction,
  useSubmitListing,
  useUpdateListing,
} from "@/features/lister/listing-hooks"
import { usePermissions } from "@/features/lister/org-hooks"
import { type ListerListing } from "@/lib/api/lister"
import { formatNaira } from "@/lib/format"
import { DetailSkeleton } from "@/components/ui/page-skeletons"

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
      <NewListingWizard
        draft={draft}
        onChange={setDraft}
        saving={create.isPending}
        onCreate={() => create.mutate(toInput(draft))}
      />
    </>
  )
}

const noticeTone = {
  good: "border-primary/25 bg-primary/10 [&_svg]:text-primary",
  warn: "border-amber-500/30 bg-amber-500/10 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
  bad: "border-destructive/30 bg-destructive/10 [&_svg]:text-destructive",
} as const

function Notice({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: keyof typeof noticeTone
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${noticeTone[tone]}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">{title}. </span>
        {children}
      </p>
    </div>
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

  const photos = usePhotos(listing.id).data ?? []
  const docs = useDocuments(listing.id).data ?? []
  const readyPhotos = photos.filter((p) => p.status !== "REJECTED").length
  const readyDocs = docs.filter((d) => d.status !== "REJECTED").length
  const readiness: ReadinessItem[] = [
    {
      label: "Title and description",
      hint: "A clear title and at least 20 characters.",
      done: Boolean(listing.title && (listing.description?.length ?? 0) >= 20),
    },
    {
      label: "Price and property type",
      hint: "Set the rent and choose a type.",
      done: Boolean(listing.priceKobo && listing.propertyTypeId),
    },
    {
      label: "Location and address",
      hint: "State, area and street address.",
      done: Boolean(listing.stateId && listing.lgaId && listing.addressLine),
    },
    {
      label: "Map pin",
      hint: "Drop a pin so renters can find it.",
      done: listing.latitude != null && listing.longitude != null,
    },
    {
      label: "3 photos or more",
      hint: `${readyPhotos} of 3 added.`,
      done: readyPhotos >= 3,
      href: "#photos-title",
    },
    {
      label: "Proof of ownership",
      hint: "Upload at least one document.",
      done: readyDocs >= 1,
      href: "#docs-title",
    },
  ]

  const confirm = useConfirm()
  const params = useSearchParams()
  const [bannerDone, setBannerDone] = React.useState(false)
  const askAvailable =
    params.get("confirm") === "available" &&
    ["PUBLISHED", "PAUSED"].includes(listing.status) &&
    can("listing:close") &&
    !bannerDone
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
      {askAvailable ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Is this property still available?</p>
            <p className="text-sm text-muted-foreground">
              Confirming keeps it in search and stops the reminder emails.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={status.confirm.isPending}
              onClick={() =>
                status.confirm.mutate(undefined, {
                  onSuccess: () => setBannerDone(true),
                })
              }
            >
              Yes, still available
            </Button>
            <Button variant="outline" onClick={() => setBannerDone(true)}>
              Not now
            </Button>
          </div>
        </div>
      ) : null}
      <ListerHero
        icon={Building2}
        eyebrow="Listing"
        title={listing.title}
        description={
          listing.moveInTotalKobo
            ? `Move-in total ${formatNaira(listing.moveInTotalKobo)} · renewal ${formatNaira(listing.renewalKobo)}`
            : "Edit the details, photos and proof of ownership."
        }
        actions={
          <>
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
                onClick={() =>
                  confirm.ask({
                    title: "Delete this listing?",
                    description: `"${listing.title}" and its photos and documents will be permanently removed. This can't be undone.`,
                    confirmLabel: "Delete listing",
                    tone: "danger",
                    run: () => remove.mutateAsync(),
                  })
                }
              >
                Delete
              </Button>
            ) : null}
          </>
        }
        stats={[
          {
            label: "Status",
            value: <StatusBadge status={listing.status} />,
            icon: Radio,
            tone: listing.status === "PUBLISHED" ? "good" : "default",
          },
          {
            label: "Price",
            value: formatNaira(listing.priceKobo),
            icon: Banknote,
            hint: listing.rentPeriod
              ? `per ${listing.rentPeriod.toLowerCase()}`
              : undefined,
          },
          {
            label: "Photos",
            value: `${readyPhotos}`,
            icon: Images,
            tone: readyPhotos >= 3 ? "good" : "warn",
            hint: readyPhotos >= 3 ? "Enough to submit" : "Add at least 3",
          },
          {
            label: "Documents",
            value: `${readyDocs}`,
            icon: FileCheck2,
            tone: readyDocs ? "good" : "warn",
            hint: readyDocs ? "Proof uploaded" : "Proof needed",
          },
        ]}
      />

      {listing.status === "REJECTED" && listing.latestReview?.reason ? (
        <Notice tone="bad" icon={AlertTriangle} title="Changes needed">
          {listing.latestReview.reason}
        </Notice>
      ) : null}
      {listing.status === "PENDING_REVIEW" ? (
        <Notice tone="warn" icon={Clock3} title="In review">
          You can edit again once the team has decided.
        </Notice>
      ) : null}
      {listing.status === "PUBLISHED" ? (
        <Notice tone="good" icon={BadgeCheck} title="This listing is live">
          Changing the address, location, property type or photos sends it back
          to review. Price and description edits stay live.
        </Notice>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <ListingForm
            draft={draft}
            onChange={setDraft}
            disabled={locked}
            saving={update.isPending}
            onSave={save}
          />
          <PhotosManager
            listingId={listing.id}
            disabled={locked || !canMedia}
          />
          <DocumentsManager
            listingId={listing.id}
            disabled={locked || !canMedia}
            canDelete={editable && canMedia}
          />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          {editable ? <ListingReadiness items={readiness} /> : null}
          {can("inspection:manage") && listing.status !== "CLOSED" ? (
            <ViewingTimesCard listingId={listing.id} />
          ) : null}
        </aside>
      </div>
      {confirm.dialog}
    </>
  )
}

export function ListingEditor({ id }: { id?: string }) {
  const query = useListerListing(id)

  if (!id) return <NewListing />
  if (query.isPending) return <DetailSkeleton />
  if (!query.data)
    return <RetryState label="this listing" onRetry={() => query.refetch()} />
  return <EditListing key={query.data.id} listing={query.data} />
}
