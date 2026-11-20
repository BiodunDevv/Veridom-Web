import Link from "next/link"

import { Button } from "@/components/ui/button"

type SectionHeadingProps = {
  title: string
  description: string
  action?: string
  href?: string
}

export function SectionHeading({
  title,
  description,
  action,
  href = "#",
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
      <div className="flex max-w-3xl flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action ? (
        <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
          <Link href={href}>{action}</Link>
        </Button>
      ) : null}
    </div>
  )
}
