"use client"

import {
  Building2,
  CalendarCheck,
  Check,
  Crown,
  KeyRound,
  Lock,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react"

import { ListerHero } from "@/components/lister/lister-ui"
import { useMine, usePermissions } from "@/features/lister/org-hooks"
import {
  PERMISSION_GROUPS,
  PERMISSION_HINTS,
  PERMISSION_LABELS,
} from "@/lib/permissions"
import { cn } from "@/lib/utils"

const GROUP_ICON: Record<string, LucideIcon> = {
  Listings: Building2,
  Renting: CalendarCheck,
  Inquiries: MessageSquare,
  Team: Users,
  Lister: Settings2,
}

/** Read-only: every member can see what their role includes, and what it doesn't. */
export function MyRolePage() {
  const { can, org } = usePermissions()
  const mine = useMine().data
  const membership = mine?.organizations.find(
    (o) => o.organizationId === mine.activeOrganizationId
  )
  const total = PERMISSION_GROUPS.reduce((n, g) => n + g.keys.length, 0)
  const allowed = PERMISSION_GROUPS.reduce(
    (n, g) => n + g.keys.filter((k) => can(k)).length,
    0
  )
  const areas = PERMISSION_GROUPS.filter((g) => g.keys.some((k) => can(k)))
  const owner = Boolean(membership?.isOwner)

  return (
    <>
      <ListerHero
        icon={owner ? Crown : ShieldCheck}
        eyebrow="Your access"
        title={membership?.roleName ?? "My role"}
        description={`What you can do in ${org?.name ?? "this lister"}. Your role is set by an owner or manager.`}
        stats={[
          {
            label: "Role",
            value: membership?.roleName ?? "—",
            icon: owner ? Crown : ShieldCheck,
            tone: "good",
          },
          {
            label: "Permissions",
            value: `${allowed}/${total}`,
            icon: KeyRound,
            hint: allowed === total ? "Full access" : "Included in your role",
          },
          {
            label: "Areas",
            value: `${areas.length}/${PERMISSION_GROUPS.length}`,
            icon: Building2,
          },
          {
            label: "Not included",
            value: total - allowed,
            icon: Lock,
            hint: total - allowed ? "Ask an owner" : "Nothing missing",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => {
          const Icon = GROUP_ICON[group.label] ?? ShieldCheck
          const count = group.keys.filter((k) => can(k)).length
          return (
            <section
              key={group.label}
              className="overflow-hidden rounded-2xl bg-card shadow-md"
            >
              <header className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {group.label}
                </h2>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {count}/{group.keys.length}
                </span>
              </header>
              <ul className="divide-y">
                {group.keys.map((key) => {
                  const on = can(key)
                  return (
                    <li key={key} className="flex items-start gap-3 px-4 py-3">
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                          on
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                        aria-hidden
                      >
                        {on ? (
                          <Check className="size-3" />
                        ) : (
                          <Lock className="size-2.5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            !on && "text-muted-foreground"
                          )}
                        >
                          {PERMISSION_LABELS[key]}
                          <span className="sr-only">
                            {on ? " (allowed)" : " (not included)"}
                          </span>
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {PERMISSION_HINTS[key]}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      {!owner && total - allowed > 0 ? (
        <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          Need something that&apos;s locked? Ask an owner or manager of{" "}
          {org?.name ?? "this lister"} to update your role.
        </p>
      ) : null}
    </>
  )
}
