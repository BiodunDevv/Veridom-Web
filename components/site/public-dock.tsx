"use client"

import { usePathname } from "next/navigation"

import { CustomerDock } from "@/components/account/profile-dock"
import { useMe } from "@/features/auth/hooks"

/**
 * Signed-in visitors get the same tab bar on the search and listing pages as
 * in their profile. Marketing pages show none, so they read like a website.
 */
export function PublicDock() {
  const me = useMe().data
  const pathname = usePathname()
  if (!me || !pathname.startsWith("/properties")) return null
  return <CustomerDock />
}
