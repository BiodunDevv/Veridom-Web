"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUp, FileText } from "lucide-react"

import { Section } from "@/components/landing/section"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type LegalSection = {
  id: string
  title: string
  content: React.ReactNode
}

export type LegalHighlight = {
  icon: React.ReactNode
  title: string
  text: string
}

/** Long-form legal page: key points, a contents list that follows the reader, and numbered sections. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  highlights,
  sections,
  other,
}: {
  eyebrow: string
  title: string
  updated: string
  intro: string
  highlights: LegalHighlight[]
  sections: LegalSection[]
  other: { href: string; label: string }
}) {
  const [active, setActive] = React.useState(sections[0]?.id)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-120px 0px -65% 0px" }
    )
    els.forEach((el) => observer.observe(el))

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [sections])

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />

      <section className="border-b bg-linear-to-br from-secondary/80 via-background to-background">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pt-10 pb-10 sm:px-8 lg:px-12 lg:pt-16 lg:pb-14">
          <span className="animate-appear inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <FileText className="size-3.5" /> {eyebrow}
          </span>
          <h1 className="animate-appear text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p
            className="animate-appear max-w-2xl text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg"
            style={{ "--appear-delay": "100ms" } as React.CSSProperties}
          >
            {intro}
          </p>
          <p
            className="animate-appear text-xs font-semibold text-muted-foreground"
            style={{ "--appear-delay": "150ms" } as React.CSSProperties}
          >
            Last updated {updated}
          </p>
        </div>
      </section>

      <Section className="pt-8 lg:pt-12">
        <ul className="grid gap-3 md:grid-cols-3">
          {highlights.map(({ icon, title: t, text }) => (
            <li
              key={t}
              className="flex items-start gap-4 rounded-2xl bg-card p-5 shadow-md"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </span>
              <span>
                <span className="block font-semibold">{t}</span>
                <span className="block text-sm text-muted-foreground">
                  {text}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <nav
            aria-label="Contents"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              On this page
            </p>
            <ol className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {sections.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:whitespace-normal",
                      active === s.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span className="text-xs tabular-nums opacity-70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="flex min-w-0 flex-col gap-10">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 rounded-2xl bg-card p-6 shadow-md sm:p-8"
              >
                <h2 className="mb-4 flex items-baseline gap-3 text-xl font-semibold tracking-tight sm:text-2xl">
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <div className="flex flex-col gap-3 text-sm leading-relaxed font-medium text-muted-foreground sm:text-base [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_li]:marker:text-primary [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                  {s.content}
                </div>
              </section>
            ))}

            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-panel p-6 text-panel-foreground shadow-md sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="text-lg font-semibold">
                  Questions about this page?
                </p>
                <p className="text-sm opacity-85">
                  Our team will gladly explain anything in plain words.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href="/contact#message">Contact us</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-panel-foreground hover:bg-panel-foreground/15 hover:text-panel-foreground"
                >
                  <Link href={other.href}>{other.label}</Link>
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowUp className="size-4" /> Back to top
            </button>
          </article>
        </div>
      </Section>
    </>
  )
}
