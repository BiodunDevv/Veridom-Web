"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BadgeCheck, LogOut, Mail, Search, ShieldCheck } from "lucide-react"

import {
  ListGroup,
  ListRow,
  MetricLink,
  MetricRow,
} from "@/components/account/app-list"
import { BecomeListerDialog } from "@/components/account/become-lister-dialog"
import { InstallApp } from "@/components/account/install-app"
import { ListersSection } from "@/components/account/listers-section"
import { useLogoutConfirm } from "@/components/account/logout-dialog"
import { Button } from "@/components/ui/button"
import { PatternBg } from "@/components/ui/pattern-bg"
import { useMe } from "@/features/auth/hooks"
import { useChatUnread } from "@/features/chat/hooks"
import { useDeals, useInspections } from "@/features/deals/hooks"
import { useUnreadCount } from "@/features/notifications/hooks"
import { initialsOf } from "@/lib/initials"

export function OverviewPage() {
  const router = useRouter()
  const me = useMe().data
  const deals = useDeals().data
  const viewings = useInspections().data
  const logout = useLogoutConfirm()
  const unreadChats = useChatUnread("customer", true).data
  const unreadAlerts = useUnreadCount(true).data
  const params = useSearchParams()
  const [creating, setCreating] = React.useState(params.get("lister") === "new")

  return (
    <>
      {/* Profile card: who you are, and your numbers in one row. */}
      <section className="relative isolate overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <PatternBg className="-z-10 opacity-60 dark:opacity-70" />
        <div className="flex items-center gap-3.5 p-4 sm:p-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-sm ring-4 ring-primary/15">
            {initialsOf(me?.firstName, me?.lastName)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg leading-tight font-semibold tracking-tight">
              {me?.firstName} {me?.lastName}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {me?.email}
            </p>
            {me?.emailVerifiedAt ? (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified
              </p>
            ) : null}
          </div>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
          >
            <Link href="/account/security" aria-label="Password and security">
              <ShieldCheck />
            </Link>
          </Button>
        </div>
        <MetricRow label="Your activity">
          <MetricLink
            href="/account/deals"
            label="Deals"
            value={deals?.length}
          />
          <MetricLink
            href="/account/viewings"
            label="Viewings"
            value={viewings?.length}
          />
          <MetricLink
            href="/account/messages"
            label="Unread chats"
            value={unreadChats}
            fresh={Boolean(unreadChats)}
          />
          <MetricLink
            href="/account/notifications"
            label="Alerts"
            value={unreadAlerts}
            fresh={Boolean(unreadAlerts)}
          />
        </MetricRow>
      </section>

      <ListersSection onCreate={() => setCreating(true)} />

      <InstallApp />

      {/* On phones there is no sidebar, so the account links live here. */}
      <ListGroup label="Account" className="lg:hidden">
        <ListRow
          href="/account/security"
          icon={<ShieldCheck />}
          title="Password & security"
          subtitle="Devices and sign-in"
        />
        <ListRow
          href="/properties"
          icon={<Search />}
          title="Browse properties"
          subtitle="Find your next home"
        />
        <ListRow
          href="/contact"
          icon={<Mail />}
          title="Contact Veridom"
          subtitle="We usually reply fast"
        />
      </ListGroup>

      <Button
        variant="outline"
        size="lg"
        className="w-full bg-card text-destructive hover:text-destructive lg:hidden"
        disabled={logout.pending}
        onClick={logout.ask}
      >
        <LogOut /> Log out
      </Button>

      <BecomeListerDialog
        open={creating}
        onOpenChange={(next) => {
          setCreating(next)
          if (!next && params.get("lister")) router.replace("/account")
        }}
      />
      {logout.dialog}
    </>
  )
}
