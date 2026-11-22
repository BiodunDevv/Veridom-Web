"use client"

import { useRouter } from "next/navigation"
import { Building2, Check, ChevronsUpDown, LogOut, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMine, useSwitchOrg } from "@/features/lister/org-hooks"

export function OrgSwitcher() {
  const router = useRouter()
  const mine = useMine().data
  const switchOrg = useSwitchOrg((id) =>
    router.push(id ? "/lister" : "/account")
  )
  const current = mine?.organizations.find(
    (org) => org.organizationId === mine.activeOrganizationId
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-48">
          <Building2 />
          <span className="truncate">{current?.name ?? "Choose lister"}</span>
          <ChevronsUpDown className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Continue as</DropdownMenuLabel>
        {mine?.organizations.map((org) => (
          <DropdownMenuItem
            key={org.organizationId}
            disabled={switchOrg.isPending}
            onSelect={() => switchOrg.mutate(org.organizationId)}
          >
            <Building2 />
            <span className="flex-1 truncate">{org.name}</span>
            <span className="text-xs text-muted-foreground">
              {org.roleName}
            </span>
            {org.organizationId === mine.activeOrganizationId ? (
              <Check />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/account?lister=new")}>
          <Plus /> Add a lister
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => switchOrg.mutate(null)}>
          <LogOut /> Leave lister area
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
