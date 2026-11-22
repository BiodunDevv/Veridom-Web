"use client"

import { Loader2 } from "lucide-react"

import { PageHeader } from "@/components/account/page-header"
import { Field, inputClass } from "@/components/site/field"
import { Button } from "@/components/ui/button"
import { usePermissions, useUpdateOrg } from "@/features/lister/org-hooks"

export function ListerSettingsPage() {
  const { org } = usePermissions()
  const update = useUpdateOrg()

  return (
    <>
      <PageHeader
        title="Settings"
        description="How your lister appears to customers."
      />
      <form
        key={org?.id}
        className="grid max-w-xl gap-4 rounded-xl bg-card p-5 shadow-md sm:p-6"
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
        <Field label="Lister name">
          <input
            name="name"
            required
            minLength={2}
            defaultValue={org?.name}
            className={inputClass}
          />
        </Field>
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
        <Button
          type="submit"
          disabled={update.isPending}
          className="justify-self-start"
        >
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Save
        </Button>
      </form>
    </>
  )
}
