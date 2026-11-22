"use client"

import { ShieldCheck } from "lucide-react"

import { ReserveDialog } from "@/components/listings/detail/reserve-dialog"
import { MessageDialog } from "@/components/listings/detail/message-dialog"
import { ViewingDialog } from "@/components/listings/detail/viewing-dialog"
import { Button } from "@/components/ui/button"
import { useAuthModal } from "@/components/auth/auth-modal"
import { useMe } from "@/features/auth/hooks"
import type { ListingDetail } from "@/lib/api/listings"

export function ReserveCard({ listing }: { listing: ListingDetail }) {
  const signedIn = Boolean(useMe().data)
  const auth = useAuthModal()

  return (
    <section
      className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md"
      aria-labelledby="interested"
    >
      <h2 id="interested" className="text-lg font-semibold">
        Interested?
      </h2>
      <p className="text-sm text-muted-foreground">
        Listed by{" "}
        <span className="font-medium text-foreground">
          {listing.lister.name}
        </span>
        . Ask a question, book a viewing or reserve. Contact details are shared
        after a confirmed viewing.
      </p>
      {signedIn ? (
        <div className="flex flex-col gap-2">
          {listing.listingType === "RENT" ? (
            <ReserveDialog
              listingId={listing.id}
              title={listing.title}
              moveInTotalKobo={listing.moveInTotalKobo}
            />
          ) : (
            <p className="rounded-lg bg-secondary p-3 text-sm">
              Online reservation is for rentals. Book a viewing to speak to the
              seller.
            </p>
          )}
          <ViewingDialog listingId={listing.id} title={listing.title} />
          <MessageDialog
            listingId={listing.id}
            title={listing.title}
            listerName={listing.lister.name}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => auth.open("login")}>
            Sign in to reserve or view
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => auth.open("register")}
          >
            Create a free account
          </Button>
        </div>
      )}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" /> Never pay outside Veridom.
        Payments are held until move-in.
      </p>
    </section>
  )
}
