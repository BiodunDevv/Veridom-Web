"use client"

import * as React from "react"
import { Bell, Lock, Mail, MonitorSmartphone } from "lucide-react"

import { NotificationList } from "@/components/notifications/notification-list"
import { metaFor } from "@/components/notifications/notification-meta"
import { PageHeader } from "@/components/account/page-header"
import { Panel } from "@/components/account/panel"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  usePreferences,
  useSetPreference,
} from "@/features/notifications/hooks"
import { cn } from "@/lib/utils"

/** Everything that's happened, and what you want to hear about. */
export function NotificationsPage() {
  const prefs = usePreferences()
  const set = useSetPreference()

  return (
    <>
      <PageHeader
        title="Notifications"
        description="See what's happened and choose how Veridom reaches you."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Recent" description="Newest first.">
          <NotificationList
            showSettingsLink={false}
            className="max-h-[32rem]"
          />
        </Panel>

        <Panel
          title="Preferences"
          description="Pick where each kind of update goes. Payments, refunds and payouts always email you."
        >
          {prefs.isLoading ? (
            <div className="flex flex-col gap-3" aria-busy>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              <li
                aria-hidden
                className="hidden grid-cols-[1fr_4.5rem_4.5rem] items-center gap-2 px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:grid"
              >
                <span />
                <span className="flex items-center justify-center gap-1">
                  <MonitorSmartphone className="size-3.5" /> In app
                </span>
                <span className="flex items-center justify-center gap-1">
                  <Mail className="size-3.5" /> Email
                </span>
              </li>
              {(Array.isArray(prefs.data) ? prefs.data : []).map((pref) => {
                const meta = metaFor(pref.type)
                const Icon = meta.icon
                return (
                  <li
                    key={pref.type}
                    className="grid items-center gap-3 rounded-xl border bg-background/60 p-3 sm:grid-cols-[1fr_4.5rem_4.5rem] sm:gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl",
                          meta.tone
                        )}
                      >
                        <Icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {pref.label || meta.label}
                        </span>
                        {pref.essential ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="size-3" aria-hidden /> Email is
                            always on
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground sm:justify-center">
                      <span className="sm:hidden">In app</span>
                      <Switch
                        checked={pref.inApp}
                        onCheckedChange={(inApp) =>
                          set.mutate({ type: pref.type, inApp })
                        }
                        aria-label={`${pref.label} in app`}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground sm:justify-center">
                      <span className="sm:hidden">Email</span>
                      <Switch
                        checked={pref.email}
                        disabled={pref.essential}
                        onCheckedChange={(email) =>
                          set.mutate({ type: pref.type, email })
                        }
                        aria-label={`${pref.label} by email`}
                      />
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Bell className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Security emails, such as new sign-ins and password changes, are
            always sent.
          </p>
        </Panel>
      </div>
    </>
  )
}
