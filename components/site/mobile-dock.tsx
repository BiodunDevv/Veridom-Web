/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { useTheme } from "next-themes"

import { useThemeToggle } from "@/components/theme-toggle"
import { I8Icon, type I8Name } from "@/components/ui/i8-icon"
import { cn } from "@/lib/utils"

export type DockItem = {
  label: string
  icon?: LucideIcon
  /** Icons8 line icon; the filled twin shows while the tab is active. */
  i8?: I8Name
  /** Use instead of `icon` when you already have an element. */
  iconNode?: React.ReactNode
  href?: string
  onClick?: () => void
  /** Extra paths that also light this tab. */
  match?: (pathname: string) => boolean
  /** A count shown as a small dot on the icon (hidden at 0). */
  badge?: number
}

const isActive = (item: DockItem, pathname: string) =>
  item.match
    ? item.match(pathname)
    : item.href
      ? item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
      : false

/** Full-colour Icons8 "Fluency" artwork, self-hosted in /public/icons/fluency. */
export type DockArt =
  | "appointment-reminders"
  | "security-shield-green"
  | "briefcase"
  | "info"
  | "mail"
  | "moon-symbol"
  | "sun"
  | "shutdown"
  | "change"
  | "synchronize"
  | "logout-rounded-left"
  | "conference-call"
  | "money-bag"
  | "time-machine"
  | "settings"
  | "real-estate"

/** Each tile gets a soft wash that matches its artwork. */
const WASH: Record<string, string> = {
  amber: "from-amber-400/20 to-amber-400/5 ring-amber-500/15",
  emerald: "from-emerald-500/20 to-emerald-500/5 ring-emerald-500/15",
  orange: "from-orange-500/20 to-orange-500/5 ring-orange-500/15",
  sky: "from-sky-500/20 to-sky-500/5 ring-sky-500/15",
  blue: "from-blue-500/20 to-blue-500/5 ring-blue-500/15",
  violet: "from-indigo-500/20 to-indigo-500/5 ring-indigo-500/15",
  rose: "from-rose-500/20 to-rose-500/5 ring-rose-500/15",
  red: "from-red-500/20 to-red-500/5 ring-red-500/15",
  slate: "from-slate-500/20 to-slate-500/5 ring-slate-500/15",
  green: "from-primary/20 to-primary/5 ring-primary/15",
  cyan: "from-cyan-500/20 to-cyan-500/5 ring-cyan-500/15",
}

export type DockWash = keyof typeof WASH

export const dockTileClass = (wash?: DockWash) =>
  cn(
    "group relative flex flex-col items-center gap-2 rounded-2xl px-2 pt-3.5 pb-3 text-center ring-1 transition-[transform,background-color] outline-none ring-inset focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
    wash
      ? cn("bg-gradient-to-b", WASH[wash])
      : "bg-foreground/[0.04] ring-transparent"
  )

/** A tile for the expanded "More" panel. */
export function DockTile({
  icon: Icon,
  art,
  wash,
  label,
  href,
  onClick,
  tone,
  badge,
}: {
  icon?: LucideIcon
  art?: DockArt
  wash?: DockWash
  label: string
  href?: string
  onClick?: () => void
  tone?: "danger"
  badge?: number
}) {
  const body = (
    <>
      {art ? (
        <span className="relative grid size-11 place-items-center">
          <img
            src={`/icons/fluency/${art}.png`}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            className="size-10 drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
          />
          {badge ? (
            <span className="absolute -top-1 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </span>
      ) : Icon ? (
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
      ) : null}
      <span className="text-[12px] leading-tight font-semibold">{label}</span>
    </>
  )
  const cls = dockTileClass(wash)

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

/** Theme switch as a tile: shows the moon in light mode and the sun in dark. */
export function ThemeTile() {
  const { resolvedTheme } = useTheme()
  const toggle = useThemeToggle()
  const dark = resolvedTheme === "dark"
  return (
    <DockTile
      art={dark ? "sun" : "moon-symbol"}
      wash={dark ? "amber" : "violet"}
      label={dark ? "Light mode" : "Dark mode"}
      onClick={toggle}
    />
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
  moreActive,
}: {
  items: DockItem[]
  more?: React.ReactNode
  moreLabel?: string
  /** Pages that live behind "More", so the tab lights up when you are on one. */
  moreActive?: (pathname: string) => boolean
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
  const moreOn = Boolean(more && moreActive?.(pathname))
  const activeIndex =
    open || moreOn
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
                    "mx-auto mt-1.5 block h-8 w-12 rounded-full shadow-md ring-1 ring-white/30 transition-colors duration-300",
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
                          "grid h-8 w-12 place-items-center rounded-full transition-[color,transform] duration-300 [&_svg]:size-[19px]",
                          active
                            ? "-translate-y-px scale-110 text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="relative grid place-items-center">
                          {item.i8 ? (
                            <I8Icon
                              name={item.i8}
                              filled={active}
                              className="size-[21px]"
                            />
                          ) : (
                            (item.iconNode ??
                            (item.icon ? (
                              <item.icon className="size-[19px]" />
                            ) : null))
                          )}
                          {item.badge ? (
                            <span
                              aria-label={`${item.badge} unread`}
                              className="absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] leading-4 font-bold text-white tabular-nums ring-2 ring-background"
                            >
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          ) : null}
                        </span>
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
                          "grid h-8 w-12 place-items-center rounded-full transition-[color,transform] duration-300",
                          open
                            ? "scale-110 text-background"
                            : moreOn
                              ? "scale-110 text-primary-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        {open ? (
                          <I8Icon name="multiply" className="size-[19px]" />
                        ) : (
                          <I8Icon name="ellipsis" className="size-[21px]" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[10.5px] leading-none font-semibold",
                          open || moreOn
                            ? "text-foreground"
                            : "text-muted-foreground"
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
