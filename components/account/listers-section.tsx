"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Crown, Plus } from "lucide-react"

import { ListGroup, ListRow } from "@/components/account/app-list"
import { useMine, useSwitchOrg } from "@/features/lister/org-hooks"

const MAX_LISTERS = 5

const initialsOfName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "L"

/**
 * Listers the person belongs to, as rows they can tap to open, or a single
 * row inviting them to create their first.
 */
export function ListersSection({ onCreate }: { onCreate: () => void }) {
  const router = useRouter()
  const mine = useMine().data
  const orgs = mine?.organizations ?? []
  const activeId = mine?.activeOrganizationId ?? null
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const switchOrg = useSwitchOrg(() => router.push("/lister"))
  const atLimit = orgs.length >= MAX_LISTERS

  const open = (id: string) => {
    setPendingId(id)
    switchOrg.mutate(id, { onSettled: () => setPendingId(null) })
  }

  if (!orgs.length) {
    return (
      <div id="listers" className="scroll-mt-28">
        <ListGroup label="Lister workspace">
          <ListRow
            icon={<Crown />}
            title="Become a lister"
            subtitle="Publish verified listings and receive payouts"
            onClick={onCreate}
          />
        </ListGroup>
      </div>
    )
  }

  return (
    <div id="listers" className="scroll-mt-28">
      <ListGroup
        label="Your listers"
        action={
          <span className="text-xs text-muted-foreground tabular-nums">
            {orgs.length} of {MAX_LISTERS}
          </span>
        }
      >
        {orgs.map((org) => {
          const active = org.organizationId === activeId
          return (
            <ListRow
              key={org.organizationId}
              icon={
                <span className="text-sm font-semibold">
                  {initialsOfName(org.name)}
                </span>
              }
              title={org.name}
              subtitle={org.isOwner ? "Owner" : org.roleName}
              trailing={
                active ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Active
                  </span>
                ) : null
              }
              busy={pendingId === org.organizationId}
              disabled={switchOrg.isPending}
              onClick={() => open(org.organizationId)}
            />
          )
        })}
        <ListRow
          icon={<Plus />}
          title="Add a lister"
          subtitle={
            atLimit
              ? "You have reached the limit of 5"
              : `${MAX_LISTERS - orgs.length} more available`
          }
          disabled={atLimit}
          onClick={onCreate}
        />
      </ListGroup>
    </div>
  )
}
