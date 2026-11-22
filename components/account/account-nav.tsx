import type { ReactNode } from "react"
import {
  CalendarCheckIcon,
  HandshakeIcon,
  LayoutGridIcon,
  ShieldCheckIcon,
} from "lucide-react"

export type SidebarNavItem = {
  title: string
  path: string
  icon?: ReactNode
  /** Match this item for every path below it, not only the exact one. */
  prefix?: boolean
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const navGroups: SidebarNavGroup[] = [
  {
    items: [{ title: "Overview", path: "/account", icon: <LayoutGridIcon /> }],
  },
  {
    label: "My renting",
    items: [
      {
        title: "Deals",
        path: "/account/deals",
        icon: <HandshakeIcon />,
        prefix: true,
      },
      {
        title: "Viewings",
        path: "/account/viewings",
        icon: <CalendarCheckIcon />,
        prefix: true,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Security",
        path: "/account/security",
        icon: <ShieldCheckIcon />,
        prefix: true,
      },
    ],
  },
]

export const navLinks = navGroups.flatMap((group) => group.items)

export const isActivePath = (item: SidebarNavItem, pathname: string) =>
  item.prefix
    ? pathname === item.path || pathname.startsWith(`${item.path}/`)
    : pathname === item.path
