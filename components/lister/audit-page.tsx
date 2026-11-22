"use client"

import * as React from "react"
import {
  Activity,
  Building2,
  Handshake,
  KeyRound,
  ScrollText,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"

import {
  ListerEmpty,
  ListerHero,
  ListSkeleton,
  initialsOf,
  timeAgo,
} from "@/components/lister/lister-ui"
import { RetryState } from "@/components/retry-state"
import { useAuditLogs } from "@/features/lister/org-hooks"
import { formatDate } from "@/lib/format"

const iconFor = (action = ""): LucideIcon => {
  const a = action.toUpperCase()
  if (a.includes("LISTING")) return Building2
  if (a.includes("DEAL") || a.includes("PAYOUT")) return Handshake
  if (a.includes("INVITE")) return UserPlus
  if (a.includes("MEMBER") || a.includes("ROLE")) return Users
  if (a.includes("ORG") || a.includes("SETTING")) return Settings
  if (a.includes("HANDOVER") || a.includes("CODE")) return KeyRound
  return Activity
}

const dayLabel = (value?: string) => {
  if (!value) return "Earlier"
  const d = new Date(value)
  const key = (x: Date) =>
    x.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" })
  const today = new Date()
  const yesterday = new Date(Date.now() - 86_400_000)
  if (key(d) === key(today)) return "Today"
  if (key(d) === key(yesterday)) return "Yesterday"
  return d.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Lagos",
  })
}

export function AuditPage() {
  const query = useAuditLogs(true)
  const logs = React.useMemo(() => query.data ?? [], [query.data])

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof logs>()
    for (const log of logs) {
      const label = dayLabel(log.createdAt)
      map.set(label, [...(map.get(label) ?? []), log])
    }
    return [...map.entries()]
  }, [logs])

  const people = new Set(logs.map((l) => l.actorName).filter(Boolean)).size
  const today = logs.filter((l) => dayLabel(l.createdAt) === "Today").length

  return (
    <>
      <ListerHero
        icon={ScrollText}
        eyebrow="Audit"
        title="Activity"
        description="Who did what in this lister, newest first."
        loading={query.isPending}
        stats={[
          { label: "Events", value: logs.length, icon: Activity },
          { label: "Today", value: today, icon: Activity, tone: "good" },
          { label: "People", value: people, icon: Users },
          {
            label: "Latest",
            value: logs[0]?.createdAt ? timeAgo(logs[0].createdAt) : "None",
            icon: ScrollText,
          },
        ]}
      />

      {query.isPending ? (
        <ListSkeleton rows={5} />
      ) : query.isError ? (
        <RetryState label="the activity log" onRetry={() => query.refetch()} />
      ) : logs.length === 0 ? (
        <ListerEmpty
          icon={ScrollText}
          title="No activity yet"
          hint="Changes to listings, deals, people and settings are recorded here."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([label, entries]) => (
            <section key={label} className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
              </h2>
              <ol className="relative flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-md sm:p-4">
                {entries.map((log) => {
                  const Icon = iconFor(log.action)
                  return (
                    <li
                      key={log.id}
                      className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {log.summary ??
                            log.action
                              ?.replaceAll("_", " ")
                              .toLowerCase()
                              .replace(/^./, (c) => c.toUpperCase())}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          {log.actorName ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="grid size-4 place-items-center rounded-full bg-muted text-[8px] font-semibold">
                                {initialsOf(log.actorName)}
                              </span>
                              {log.actorName}
                            </span>
                          ) : null}
                          <time
                            dateTime={log.createdAt}
                            title={formatDate(log.createdAt)}
                          >
                            {timeAgo(log.createdAt)}
                          </time>
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
