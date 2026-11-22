"use client"

import { useRouter } from "next/navigation"
import { KeyRoundIcon, LogOutIcon, ShieldCheckIcon } from "lucide-react"

import { useLogout, useMe } from "@/features/auth/hooks"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavUser() {
  const router = useRouter()
  const me = useMe().data
  const logout = useLogout()

  const initials = me
    ? `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase()
    : "…"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="pointer-events-none flex flex-col">
            <span className="font-medium text-foreground">
              {me ? `${me.firstName} ${me.lastName}` : "Loading…"}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {me?.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => router.push("/account/security")}>
            <ShieldCheckIcon />
            Security and sessions
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.push("/account/security#password")}
          >
            <KeyRoundIcon />
            Change password
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onSelect={() => logout.mutate()}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
