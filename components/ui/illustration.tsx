import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * Icons8 Ouch "3D Casual life" illustrations, downloaded into
 * public/illustrations (see icons8.json). Sizes are the files' own pixels.
 */
const ART = {
  viewings: {
    src: "/illustrations/empty-viewings.png",
    width: 456,
    height: 456,
  },
  chats: { src: "/illustrations/empty-chats.png", width: 456, height: 398 },
  deals: { src: "/illustrations/empty-deals.png", width: 456, height: 386 },
  listerDeals: {
    src: "/illustrations/empty-lister-deals.png",
    width: 456,
    height: 402,
  },
  search: { src: "/illustrations/empty-search.png", width: 456, height: 456 },
  listings: {
    src: "/illustrations/empty-listings.png",
    width: 456,
    height: 293,
  },
  listerListings: {
    src: "/illustrations/empty-lister-listings-clipboard.png",
    width: 373,
    height: 456,
  },
  notifications: {
    src: "/illustrations/empty-notifications.png",
    width: 432,
    height: 456,
  },
  paymentHeld: {
    src: "/illustrations/payment-held.png",
    width: 456,
    height: 321,
  },
  inReview: {
    src: "/illustrations/listing-in-review.png",
    width: 374,
    height: 456,
  },
  dealPay: { src: "/illustrations/deal-pay.png", width: 456, height: 448 },
  dealMoveIn: {
    src: "/illustrations/deal-move-in.png",
    width: 456,
    height: 456,
  },
  dealRenewal: {
    src: "/illustrations/deal-renewal.png",
    width: 456,
    height: 430,
  },
  logout: { src: "/illustrations/logout.png", width: 456, height: 456 },
} as const

export type IllustrationName = keyof typeof ART

const SIZES = {
  sm: "h-24 sm:h-28",
  md: "h-28 sm:h-36",
  lg: "h-32 sm:h-40",
} as const

/**
 * A decorative product illustration. The box has a fixed height and the
 * artwork is contained inside it, so wide and tall pictures sit alike.
 */
export function Illustration({
  name,
  size = "md",
  className,
  priority,
}: {
  name: IllustrationName
  size?: keyof typeof SIZES
  className?: string
  priority?: boolean
}) {
  const art = ART[name]
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none flex w-full max-w-[16rem] items-end justify-center select-none",
        SIZES[size],
        className
      )}
    >
      <Image
        src={art.src}
        width={art.width}
        height={art.height}
        alt=""
        priority={priority}
        sizes="(min-width: 640px) 256px, 200px"
        className="h-full w-auto max-w-full object-contain drop-shadow-sm"
      />
    </span>
  )
}
