import { cn } from "@/lib/utils"

type PageHeroProps = {
  title: string
  description: string
  className?: string
  children?: React.ReactNode
}

/** Title + intro on a soft gradient, used at the top of every inner page. */
export function PageHero({ title, description, className, children }: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b bg-linear-to-br from-secondary/80 via-background to-background",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 pt-10 pb-12 sm:px-8 lg:px-12 lg:pt-16 lg:pb-20">
        <h1 className="animate-appear text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p
          className="animate-appear max-w-4xl text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg"
          style={{ "--appear-delay": "100ms" } as React.CSSProperties}
        >
          {description}
        </p>
        {children}
      </div>
    </section>
  )
}
