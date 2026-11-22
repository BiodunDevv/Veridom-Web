"use client"

import { Building2, Loader2, Mail, Phone, ShieldCheck } from "lucide-react"

import { FormSkeleton } from "@/components/ui/page-skeletons"
import { ListerHero, initialsOf } from "@/components/lister/lister-ui"
import { Field, inputClass } from "@/components/site/field"
import { Button } from "@/components/ui/button"
import { PatternBg } from "@/components/ui/pattern-bg"
import { usePermissions, useUpdateOrg } from "@/features/lister/org-hooks"

export function ListerSettingsPage() {
  const { org, isLoading } = usePermissions()
  const update = useUpdateOrg()

  return (
    <>
      <ListerHero
        icon={Building2}
        eyebrow="Settings"
        title="Settings"
        description="How your lister appears to customers."
        stats={[
          { label: "Lister", value: org?.name ?? "—", icon: Building2 },
          {
            label: "Contact email",
            value: org?.contactEmail ? "Added" : "Missing",
            icon: Mail,
            tone: org?.contactEmail ? "good" : "warn",
          },
          {
            label: "Contact phone",
            value: org?.contactPhone ? "Added" : "Missing",
            icon: Phone,
            tone: org?.contactPhone ? "good" : "warn",
          },
          {
            label: "Visibility",
            value: "Public",
            icon: ShieldCheck,
            hint: "Name and contacts",
          },
        ]}
      />

      {isLoading ? (
        <FormSkeleton fields={3} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <form
            key={org?.id}
            className="grid gap-4 rounded-2xl bg-card p-5 shadow-md sm:p-6"
            onSubmit={(e) => {
              e.preventDefault()
              const data = new FormData(e.currentTarget)
              update.mutate({
                name: String(data.get("name")).trim(),
                contactEmail: String(data.get("email")).trim() || undefined,
                contactPhone: String(data.get("phone")).trim() || undefined,
              })
            }}
          >
            <div>
              <h2 className="text-lg font-semibold">Lister profile</h2>
              <p className="text-sm text-muted-foreground">
                Customers see these details on your listings.
              </p>
            </div>
            <Field label="Lister name">
              <input
                name="name"
                required
                minLength={2}
                defaultValue={org?.name}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email">
                <input
                  name="email"
                  type="email"
                  defaultValue={org?.contactEmail ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Contact phone">
                <input
                  name="phone"
                  type="tel"
                  defaultValue={org?.contactPhone ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>
            <Button
              type="submit"
              disabled={update.isPending}
              className="justify-self-start"
            >
              {update.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Save changes
            </Button>
          </form>

          <aside className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              How customers see you
            </p>
            <div className="relative isolate overflow-hidden rounded-2xl bg-card p-5 shadow-md">
              <PatternBg className="-z-10 [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-20 dark:opacity-40" />
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-md">
                {initialsOf(org?.name ?? "L")}
              </span>
              <p className="mt-4 text-lg font-semibold">
                {org?.name ?? "Your lister"}
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" aria-hidden />
                  {org?.contactEmail || "No email yet"}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" aria-hidden />
                  {org?.contactPhone || "No phone yet"}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
