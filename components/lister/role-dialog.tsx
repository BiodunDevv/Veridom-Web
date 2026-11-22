"use client"

import * as React from "react"
import {
  Building2,
  CalendarCheck,
  Check,
  Loader2,
  MessageSquare,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  useCreateRole,
  usePermissions,
  useUpdateRole,
} from "@/features/lister/org-hooks"
import {
  PERMISSIONS,
  type Permission,
  type Role,
} from "@/lib/api/organizations"
import {
  PERMISSION_GROUPS,
  PERMISSION_HINTS as HINTS,
  PERMISSION_LABELS,
} from "@/lib/permissions"

const GROUP_ICON: Record<string, LucideIcon> = {
  Listings: Building2,
  Renting: CalendarCheck,
  Inquiries: MessageSquare,
  Team: Users,
  Lister: Settings2,
}

/** Permissions that move money, people or access: worth a second look. */
const SENSITIVE = new Set<Permission>([
  "payout:manage",
  "member:manage",
  "role:manage",
  "listing:update:any",
])

const PRESETS: { name: string; blurb: string; perms: Permission[] }[] = [
  {
    name: "Agent",
    blurb: "Lists and shows properties",
    perms: [
      "listing:create",
      "listing:update:assigned",
      "media:manage",
      "inquiry:read:assigned",
      "inquiry:respond",
      "inspection:manage",
    ],
  },
  {
    name: "Viewing coordinator",
    blurb: "Runs the viewing calendar",
    perms: ["inspection:manage", "inquiry:read:any", "inquiry:respond"],
  },
  {
    name: "Accountant",
    blurb: "Deals and payouts only",
    perms: ["deal:manage", "payout:manage", "org:audit:read"],
  },
  {
    name: "Team lead",
    blurb: "Everything except roles and payouts",
    perms: [
      "listing:create",
      "listing:update:any",
      "listing:close",
      "media:manage",
      "inquiry:read:any",
      "inquiry:respond",
      "inspection:manage",
      "deal:manage",
      "member:invite",
      "org:audit:read",
    ],
  },
]

export function RoleDialog({ role }: { role?: Role }) {
  const { can } = usePermissions()
  const create = useCreateRole()
  const update = useUpdateRole()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(role?.name ?? "")
  const [picked, setPicked] = React.useState<Permission[]>(
    role?.permissions ?? []
  )
  const pending = create.isPending || update.isPending
  // You can only grant permissions you hold yourself.
  const grantable = React.useMemo(
    () => new Set(PERMISSIONS.filter((p) => can(p))),
    [can]
  )
  const groups = PERMISSION_GROUPS.map((g) => ({
    ...g,
    keys: g.keys.filter((k) => grantable.has(k)),
  })).filter((g) => g.keys.length)
  const total = groups.reduce((n, g) => n + g.keys.length, 0)
  const set = new Set(picked)
  const reset = () => {
    setName(role?.name ?? "")
    setPicked(role?.permissions ?? [])
  }

  const toggle = (permission: Permission, on: boolean) =>
    setPicked((list) =>
      on
        ? [...new Set([...list, permission])]
        : list.filter((p) => p !== permission)
    )
  const toggleGroup = (keys: Permission[], on: boolean) =>
    setPicked((list) =>
      on
        ? [...new Set([...list, ...keys])]
        : list.filter((p) => !keys.includes(p))
    )

  const save = () => {
    const done = {
      onSuccess: () => {
        setOpen(false)
        if (!role) {
          setName("")
          setPicked([])
        }
      },
    }
    if (role)
      update.mutate(
        { id: role.id, name: name.trim(), permissions: picked },
        done
      )
    else create.mutate({ name: name.trim(), permissions: picked }, done)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) reset()
      }}
    >
      <DialogTrigger asChild>
        {role ? (
          <Button size="sm" variant="ghost">
            Edit
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <Plus /> New role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="grid max-h-[92svh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="gap-1 border-b p-5 pr-12">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            {role ? `Edit ${role.name}` : "New role"}
          </DialogTitle>
          <DialogDescription>
            Choose exactly what people with this role can do.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          {!role ? (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <Sparkles className="size-3.5" aria-hidden /> Start from a
                template
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setName(preset.name)
                      setPicked(preset.perms.filter((p) => grantable.has(p)))
                    }}
                    className="rounded-xl border bg-card p-3 text-left transition-colors outline-none hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="block text-sm font-semibold">
                      {preset.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {preset.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label htmlFor="role-name" className="text-sm font-semibold">
              Role name
            </label>
            <InputGroup className="h-12 rounded-xl bg-background">
              <InputGroupAddon align="inline-start" className="pl-3.5">
                <ShieldCheck className="size-[18px] text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="e.g. Viewing coordinator"
                className="h-full text-base md:text-base"
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                Permissions{" "}
                <span className="font-normal text-muted-foreground tabular-nums">
                  {picked.length} of {total}
                </span>
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => setPicked([...grantable])}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={!picked.length}
                  onClick={() => setPicked([])}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{
                  width: `${total ? (picked.length / total) * 100 : 0}%`,
                }}
              />
            </div>

            {groups.map((group) => {
              const Icon = GROUP_ICON[group.label] ?? ShieldCheck
              const count = group.keys.filter((k) => set.has(k)).length
              const all = count === group.keys.length
              return (
                <fieldset
                  key={group.label}
                  className="overflow-hidden rounded-xl border"
                >
                  <legend className="sr-only">{group.label}</legend>
                  <div className="flex items-center justify-between gap-3 bg-muted/40 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="size-4 text-primary" aria-hidden />
                      {group.label}
                      <span className="text-xs font-normal text-muted-foreground tabular-nums">
                        {count}/{group.keys.length}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.keys, !all)}
                      className="text-xs font-semibold text-primary outline-none hover:underline focus-visible:underline"
                    >
                      {all ? "Clear" : "Select all"}
                    </button>
                  </div>
                  <ul className="divide-y">
                    {group.keys.map((permission) => {
                      const on = set.has(permission)
                      return (
                        <li key={permission}>
                          <label className="flex cursor-pointer items-center gap-3 px-3.5 py-3 transition-colors hover:bg-accent/40">
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 text-sm font-medium">
                                {PERMISSION_LABELS[permission]}
                                {SENSITIVE.has(permission) ? (
                                  <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                                    Sensitive
                                  </span>
                                ) : null}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {HINTS[permission]}
                              </span>
                            </span>
                            <Switch
                              checked={on}
                              onCheckedChange={(v) => toggle(permission, v)}
                              aria-label={PERMISSION_LABELS[permission]}
                            />
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </fieldset>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            {name.trim().length < 2
              ? "Give the role a name."
              : picked.length === 0
                ? "Pick at least one permission."
                : `${picked.length} permission${picked.length === 1 ? "" : "s"} selected`}
          </p>
          <Button
            disabled={name.trim().length < 2 || picked.length === 0 || pending}
            onClick={save}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Check />}
            {role ? "Save role" : "Create role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
