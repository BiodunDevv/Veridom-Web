import { cn } from "@/lib/utils"

/** Rounded content card used across the profile pages. */
export function Panel({
  id,
  title,
  description,
  children,
  footer,
  className,
}: {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "flex scroll-mt-28 flex-col gap-5 rounded-2xl bg-card p-5 shadow-md sm:p-6",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
