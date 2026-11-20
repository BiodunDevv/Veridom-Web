import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Service = { title: string; body: string; icon: string }

export function IconBadge({ icon }: { icon: string }) {
  return (
    <span className="shrink-0 rounded-full border border-primary/50 p-1.5">
      <span className="block rounded-full border border-primary/50 p-2.5 sm:p-3">
        <Image src={icon} alt="" width={30} height={30} unoptimized className="size-6 sm:size-7" />
      </span>
    </span>
  )
}

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  return (
    <article className={cn("flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md sm:gap-5 sm:p-6 lg:p-8", className)}>
      <div className="flex items-center gap-4">
        <IconBadge icon={service.icon} />
        <h3 className="text-lg font-semibold sm:text-xl">{service.title}</h3>
      </div>
      <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">{service.body}</p>
    </article>
  )
}

/** Highlighted call-out card with the soft line art behind it. */
export function ServiceCallout({
  title,
  body,
  action = "Learn More",
  stacked = false,
  className,
}: {
  title: string
  body: string
  action?: string
  stacked?: boolean
  className?: string
}) {
  return (
    <article
      className={cn(
        "relative isolate flex flex-col justify-center gap-4 overflow-hidden rounded-xl bg-secondary p-5 sm:gap-5 sm:p-6 lg:p-8",
        className
      )}
    >
      <Image
        src="/landing/abstract-lines.svg"
        alt=""
        fill
        unoptimized
        className="-z-10 object-cover opacity-30 dark:opacity-40"
      />
      <div className={cn("flex flex-col gap-4", !stacked && "sm:flex-row sm:items-center sm:justify-between sm:gap-6")}>
        <h3 className={cn("font-bold", stacked ? "text-xl sm:text-2xl" : "text-xl sm:text-2xl lg:text-3xl")}>{title}</h3>
        {!stacked ? (
          <Button asChild variant="outline" size="lg" className="shrink-0 self-start sm:self-auto">
            <Link href="/contact">{action}</Link>
          </Button>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">{body}</p>
      {stacked ? (
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/contact">{action}</Link>
        </Button>
      ) : null}
    </article>
  )
}
