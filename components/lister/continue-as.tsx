"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2, Plus, UserRound } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  useCreateOrg,
  useMine,
  useSwitchOrg,
} from "@/features/lister/org-hooks"

export function ContinueAs() {
  const router = useRouter()
  const mine = useMine().data
  const [name, setName] = React.useState("")
  const switchOrg = useSwitchOrg((id) =>
    router.push(id ? "/lister" : "/account")
  )
  const create = useCreateOrg(() => setName(""))

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border bg-card p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo className="size-10" />
          <h1 className="text-2xl font-semibold tracking-tight">Continue as</h1>
          <p className="text-sm text-muted-foreground">
            Pick who you&apos;re acting for. You can switch any time.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {mine?.organizations.map((org) => (
            <li key={org.organizationId}>
              <Button
                variant="outline"
                size="lg"
                className="h-14 w-full justify-start"
                disabled={switchOrg.isPending}
                onClick={() => switchOrg.mutate(org.organizationId)}
              >
                <Building2 />
                <span className="flex-1 truncate text-left">{org.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {org.roleName}
                </span>
              </Button>
            </li>
          ))}
          <li>
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start"
              onClick={() => switchOrg.mutate(null)}
            >
              <UserRound /> Myself (customer)
            </Button>
          </li>
        </ul>

        <form
          className="flex flex-col gap-3 border-t pt-5"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate(name.trim())
          }}
        >
          <label htmlFor="lister-name" className="text-sm font-semibold">
            Start a new lister
          </label>
          <div className="flex gap-2">
            <input
              id="lister-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={80}
              required
              placeholder="e.g. Lekki Homes"
              className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button type="submit" size="lg" disabled={create.isPending}>
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus />
              )}
              Create
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll be its owner. Creating a lister needs a verified email,
            and you can have up to 5.
          </p>
        </form>
      </div>
    </main>
  )
}
