import { PatternBg } from "@/components/ui/pattern-bg"

/** The page title banner: contour pattern and a soft green glow, like the lister overview. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl bg-card p-5 shadow-md sm:p-6">
      <PatternBg className="-z-10 [mask-image:linear-gradient(to_left,black,transparent_80%)] object-right opacity-25 dark:opacity-45" />
      <div
        aria-hidden
        className="absolute -top-24 -left-16 -z-10 size-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
