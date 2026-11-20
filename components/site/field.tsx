import { cn } from "@/lib/utils"

/** Label + control wrapper used by every form on the site. */
export function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <label htmlFor={htmlFor} className="text-base font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputClass =
  "h-12 w-full rounded-lg border border-input bg-secondary/60 px-4 text-sm font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
