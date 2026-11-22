import Link from "next/link"
import { LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Shown when a role does not include the page the person opened. */
export function NoAccess() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-card px-6 py-12 text-center shadow-md">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <LockKeyhole className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Not part of your role
        </h1>
        <p className="text-sm text-muted-foreground">
          Your role in this lister doesn&apos;t include this page. Ask an owner
          or manager if you need access.
        </p>
      </div>
      <Button asChild>
        <Link href="/lister">Back to overview</Link>
      </Button>
    </section>
  )
}
