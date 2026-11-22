import type { Permission } from "@/lib/api/organizations"

/** Plain-language names for the permission keys. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  "listing:create": "Create listings",
  "listing:update:any": "Edit any listing",
  "listing:update:assigned": "Edit assigned listings",
  "listing:close": "Pause or close listings",
  "media:manage": "Manage photos and documents",
  "inquiry:read:any": "Read all inquiries",
  "inquiry:read:assigned": "Read assigned inquiries",
  "inquiry:respond": "Reply to inquiries",
  "inspection:manage": "Manage viewings",
  "deal:manage": "Manage deals",
  "payout:manage": "Manage payouts",
  "member:invite": "Invite team members",
  "member:manage": "Manage team members",
  "role:manage": "Manage roles",
  "org:update": "Edit lister details",
  "org:audit:read": "View the activity log",
}

export const PERMISSION_GROUPS: { label: string; keys: Permission[] }[] = [
  {
    label: "Listings",
    keys: [
      "listing:create",
      "listing:update:any",
      "listing:update:assigned",
      "listing:close",
      "media:manage",
    ],
  },
  {
    label: "Renting",
    keys: ["inspection:manage", "deal:manage", "payout:manage"],
  },
  {
    label: "Inquiries",
    keys: ["inquiry:read:any", "inquiry:read:assigned", "inquiry:respond"],
  },
  {
    label: "Team",
    keys: ["member:invite", "member:manage", "role:manage"],
  },
  { label: "Lister", keys: ["org:update", "org:audit:read"] },
]

/** Which permission opens which lister page (first match wins, longest paths first). */
export const ROUTE_NEEDS: { path: string; needs: Permission[] }[] = [
  { path: "/lister/listings/new", needs: ["listing:create"] },
  {
    path: "/lister/listings",
    needs: [
      "listing:create",
      "listing:update:any",
      "listing:update:assigned",
      "listing:close",
      "media:manage",
    ],
  },
  { path: "/lister/viewings", needs: ["inspection:manage"] },
  { path: "/lister/deals", needs: ["deal:manage", "payout:manage"] },
  {
    path: "/lister/team",
    needs: ["member:manage", "member:invite", "role:manage"],
  },
  { path: "/lister/payouts", needs: ["payout:manage"] },
  { path: "/lister/settings", needs: ["org:update"] },
  { path: "/lister/audit", needs: ["org:audit:read"] },
]

export const needsForPath = (pathname: string) =>
  ROUTE_NEEDS.find(
    (r) => pathname === r.path || pathname.startsWith(`${r.path}/`)
  )?.needs
