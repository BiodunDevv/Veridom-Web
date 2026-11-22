"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, X, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type DockItem = {
  label: string
  icon?: LucideIcon
  /** Use instead of `icon` when you already have an element. */
  iconNode?: React.ReactNode
  href?: string
  onClick?: () => void
  /** Extra paths that also light this tab. */
  match?: (pathname: string) => boolean
}

const isActive = (item: DockItem, pathname: string) =>
  item.match
    ? item.match(pathname)
    : item.href
      ? item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
      : false

/** A tile for the expanded "More" panel. */
export function DockTile({
  icon: Icon,
  label,
  href,
  onClick,
  tone,
}: {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  tone?: "danger"
}) {
  const body = (
    <>
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl",
          tone === "danger"
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-[12px] leading-tight font-semibold">{label}</span>
    </>
  )
  const cls =
    "flex flex-col items-center gap-1.5 rounded-2xl bg-foreground/[0.04] px-2 py-3 text-center transition-transform outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"

  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  )
}

/**
 * Floating glass tab bar for phones. Tabs sit in a pill; "More" lifts the pill
 * into a panel with everything else.
 */
export function MobileDock({
  items,
  more,
  moreLabel = "More",
}: {
  items: DockItem[]
  more?: React.ReactNode
  moreLabel?: string
}) {
  const pathname = usePathname()
  // Opening is remembered per page, so moving to another page closes the panel.
  const [openAt, setOpenAt] = React.useState<string | null>(null)
  const [peek, setPeek] = React.useState<number | null>(null)
  const open = openAt === pathname

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const count = items.length + (more ? 1 : 0)
  const activeIndex = open
    ? items.length
    : items.findIndex((item) => isActive(item, pathname))
  const labelAt = (i: number) =>
    i === items.length ? (open ? "Close" : moreLabel) : items[i]?.label

  const press = {
    onPointerDown: (i: number) => () => setPeek(i),
    onPointerUp: () => setPeek(null),
    onPointerLeave: () => setPeek(null),
    onPointerCancel: () => setPeek(null),
  }

  return (
    <>
      <div
        aria-hidden
        onClick={() => setOpenAt(null)}
        className={cn(
          "fixed inset-0 z-40 bg-background/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] z-50 lg:hidden"
      >
        <div className="relative mx-auto max-w-md">
          {/* Label bubble that follows a pressed tab, like the glass dock tooltip. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 transition-[left,opacity,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              peek !== null && !open
                ? "scale-100 opacity-100"
                : "scale-90 opacity-0"
            )}
            style={{
              left: `${(((peek ?? activeIndex) + 0.5) / count) * 100}%`,
            }}
          >
            <span
              key={peek ?? "none"}
              className="block animate-in rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-background shadow-lg duration-200 fade-in-0 slide-in-from-bottom-1"
            >
              {peek !== null ? labelAt(peek) : ""}
            </span>
          </div>

          <div className="overflow-hidden rounded-[28px] border bg-background/75 shadow-2xl ring-1 shadow-black/10 ring-foreground/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            {more ? (
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  open
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="min-h-0 overflow-hidden" inert={!open}>
                  <div
                    className="max-h-[60svh] overflow-y-auto p-3 pb-1"
                    data-lenis-prevent
                  >
                    {more}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="relative p-1.5">
              {/* Sliding glass bubble behind the active tab. */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  activeIndex < 0 ? "opacity-0" : "opacity-100"
                )}
                style={{
                  width: `calc((100% - 0.75rem) / ${count})`,
                  transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
                }}
              >
                <span
                  className={cn(
                    "mx-auto mt-1.5 block h-8 w-14 rounded-full shadow-md ring-1 ring-white/30 transition-colors duration-300",
                    open ? "bg-foreground" : "bg-primary"
                  )}
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgb(255 255 255 / 0.28), transparent 55%)",
                  }}
                />
              </span>

              <ul className="relative flex items-stretch">
                {items.map((item, i) => {
                  const active = activeIndex === i
                  const content = (
                    <>
                      <span
                        className={cn(
                          "grid h-8 w-14 place-items-center rounded-full transition-[color,transform] duration-300 [&_svg]:size-[19px]",
                          active
                            ? "-translate-y-px scale-110 text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.iconNode ??
                          (item.icon ? (
                            <item.icon className="size-[19px]" />
                          ) : null)}
                      </span>
                      <span
                        className={cn(
                          "text-[10.5px] leading-none font-semibold transition-colors",
                          active ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )
                  const cls =
                    "flex w-full touch-manipulation flex-col items-center gap-1 rounded-2xl py-1.5 outline-none transition-transform active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
                  const handlers = {
                    onPointerDown: press.onPointerDown(i),
                    onPointerUp: press.onPointerUp,
                    onPointerLeave: press.onPointerLeave,
                    onPointerCancel: press.onPointerCancel,
                  }
                  return (
                    <li key={item.label} className="min-w-0 flex-1">
                      {item.href ? (
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpenAt(null)}
                          className={cls}
                          {...handlers}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenAt(null)
                            item.onClick?.()
                          }}
                          className={cls}
                          {...handlers}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  )
                })}
                {more ? (
                  <li className="min-w-0 flex-1">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenAt(open ? null : pathname)}
                      className="flex w-full touch-manipulation flex-col items-center gap-1 rounded-2xl py-1.5 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
                    >
                      <span
                        className={cn(
                          "grid h-8 w-14 place-items-center rounded-full transition-[color,transform] duration-300",
                          open
                            ? "scale-110 text-background"
                            : "text-muted-foreground"
                        )}
                      >
                        {open ? (
                          <X className="size-[19px]" />
                        ) : (
                          <LayoutGrid className="size-[19px]" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[10.5px] leading-none font-semibold",
                          open ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {open ? "Close" : moreLabel}
                      </span>
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
