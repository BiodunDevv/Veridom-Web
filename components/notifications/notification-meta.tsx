import {
  Banknote,
  Bell,
  Building2,
  CalendarCheck,
  CreditCard,
  KeyRound,
  MessageSquare,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import type { NotificationType } from "@/lib/api/notifications"

export const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; tone: string; label: string }
> = {
  message: {
    icon: MessageSquare,
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    label: "Messages",
  },
  viewing: {
    icon: CalendarCheck,
    tone: "bg-primary/10 text-primary",
    label: "Viewings",
  },
  payment: {
    icon: CreditCard,
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    label: "Payments",
  },
  refund: {
    icon: Undo2,
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    label: "Refunds",
  },
  handover: {
    icon: KeyRound,
    tone: "bg-primary/10 text-primary",
    label: "Move-in",
  },
  payout: {
    icon: Banknote,
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    label: "Payouts",
  },
  listing: {
    icon: Building2,
    tone: "bg-primary/10 text-primary",
    label: "Listings",
  },
  general: {
    icon: Bell,
    tone: "bg-muted text-muted-foreground",
    label: "General",
  },
}

export const metaFor = (type: string) =>
  TYPE_META[type as NotificationType] ?? TYPE_META.general

/** Only follow paths inside this app. */
export const safeLink = (link?: string | null) =>
  link && link.startsWith("/") && !link.startsWith("//") ? link : null
