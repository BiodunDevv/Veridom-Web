import { cn } from "@/lib/utils"

/** Shared page-width wrapper with compact vertical rhythm. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn("scroll-mt-4 px-5 py-10 sm:px-8 lg:px-12 lg:py-14", className)}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 lg:gap-8">{children}</div>
    </section>
  )
}
