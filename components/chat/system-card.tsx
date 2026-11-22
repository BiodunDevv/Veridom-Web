import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  CalendarX2,
  CreditCard,
  Home,
  KeyRound,
  Lock,
  type LucideIcon,
} from "lucide-react"

import type { ChatSide, SystemCard } from "@/lib/api/inquiries"

const CARDS: Record<
  SystemCard["type"],
  { icon: LucideIcon; text: string; tone: string }
> = {
  VIEWING_REQUESTED: {
    icon: CalendarCheck,
    text: "A viewing was requested",
    tone: "text-primary bg-primary/10",
  },
  VIEWING_CONFIRMED: {
    icon: CalendarCheck,
    text: "Viewing confirmed",
    tone: "text-primary bg-primary/10",
  },
  VIEWING_DECLINED: {
    icon: CalendarX2,
    text: "Viewing declined",
    tone: "text-destructive bg-destructive/10",
  },
  VIEWING_CANCELLED: {
    icon: CalendarX2,
    text: "Viewing cancelled",
    tone: "text-destructive bg-destructive/10",
  },
  RESERVATION_HELD: {
    icon: KeyRound,
    text: "Reserved for 30 minutes",
    tone: "text-amber-600 bg-amber-500/15 dark:text-amber-400",
  },
  PAYMENT_RECEIVED: {
    icon: CreditCard,
    text: "Payment received",
    tone: "text-emerald-600 bg-emerald-500/15 dark:text-emerald-400",
  },
  PROPERTY_TAKEN: {
    icon: Lock,
    text: "This property was taken by someone else",
    tone: "text-muted-foreground bg-muted",
  },
}

/** A centred card for things that happened outside the typing box. */
export function SystemCardView({
  card,
  side,
}: {
  card: SystemCard
  side: ChatSide
}) {
  const meta = CARDS[card.type] ?? {
    icon: Home,
    text: "Update",
    tone: "text-muted-foreground bg-muted",
  }
  const Icon = meta.icon
  const href = card.dealId
    ? `${side === "lister" ? "/lister/deals" : "/account/deals"}/${card.dealId}`
    : card.inspectionId
      ? `${side === "lister" ? "/lister/viewings" : "/account/viewings"}/${card.inspectionId}`
      : null

  return (
    <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${meta.tone}`}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <p className="min-w-0 flex-1 text-sm font-semibold">{meta.text}</p>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Open <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}
