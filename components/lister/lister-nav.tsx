import type { SidebarNavGroup } from "@/components/account/account-nav"
import type { Permission } from "@/lib/api/organizations"
import {
  BadgeDollarSignIcon,
  BuildingIcon,
  CalendarCheckIcon,
  HandshakeIcon,
  LayoutGridIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

type Item = SidebarNavGroup["items"][number] & { needs?: Permission[] }
type Group = { label?: string; items: Item[] }

const groups: Group[] = [
  { items: [{ title: "Overview", path: "/lister", icon: <LayoutGridIcon /> }] },
  {
    label: "Listings",
    items: [
      {
        title: "My listings",
        path: "/lister/listings",
        icon: <BuildingIcon />,
        prefix: true,
        needs: [
          "listing:create",
          "listing:update:any",
          "listing:update:assigned",
          "listing:close",
          "media:manage",
        ],
      },
    ],
  },
  {
    label: "Renting",
    items: [
      {
        title: "Viewings",
        path: "/lister/viewings",
        icon: <CalendarCheckIcon />,
        prefix: true,
        needs: ["inspection:manage"],
      },
      {
        title: "Deals",
        path: "/lister/deals",
        icon: <HandshakeIcon />,
        prefix: true,
        needs: ["deal:manage", "payout:manage"],
      },
    ],
  },
  {
    label: "Lister",
    items: [
      {
        title: "Team",
        path: "/lister/team",
        icon: <UsersIcon />,
        prefix: true,
        needs: ["member:manage", "member:invite", "role:manage"],
      },
      {
        title: "Payouts",
        path: "/lister/payouts",
        icon: <BadgeDollarSignIcon />,
        prefix: true,
        needs: ["payout:manage"],
      },
      {
        title: "Settings",
        path: "/lister/settings",
        icon: <SettingsIcon />,
        prefix: true,
        needs: ["org:update"],
      },
    ],
  },
]

/** Only shows what the person's role in this lister lets them use. */
export function navFor(
  can: (...keys: Permission[]) => boolean
): SidebarNavGroup[] {
  return groups
    .map((group) => ({
      label: group.label,
      items: group.items.filter((item) => !item.needs || can(...item.needs)),
    }))
    .filter((group) => group.items.length > 0)
}
