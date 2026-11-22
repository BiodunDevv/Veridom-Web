"use client"

import { Loader2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { RetryState } from "@/components/retry-state"
import { useAuditLogs } from "@/features/lister/org-hooks"
import { formatDate } from "@/lib/format"

export function AuditPage() {
  const query = useAuditLogs(true)
  const logs = query.data ?? []

  return (
    <>
      <PageHeader
        title="Activity"
        description="Who did what in this lister, newest first."
      />
      {query.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : query.isError ? (
        <RetryState label="the activity log" onRetry={() => query.refetch()} />
      ) : logs.length === 0 ? (
        <p className="rounded-xl bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-md">
          No activity yet.
        </p>
      ) : (
        <ul className="divide-y rounded-xl bg-card px-5 shadow-md">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">
                {log.summary ?? log.action?.replaceAll("_", " ").toLowerCase()}
              </span>
              <span className="text-muted-foreground">
                {[log.actorName, formatDate(log.createdAt)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
