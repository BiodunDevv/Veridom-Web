"use client"

import * as React from "react"
import {
  BadgeCheck,
  Download,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  Zap,
  Maximize,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { PatternBg } from "@/components/ui/pattern-bg"
import { usePwaInstall } from "@/hooks/use-pwa-install"

const PERKS = [
  { icon: Zap, text: "One tap from your home screen" },
  { icon: Maximize, text: "Full screen, no browser bars" },
  { icon: BadgeCheck, text: "Stays signed in on your device" },
]

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {n}
      </span>
      <span className="flex flex-wrap items-center gap-1.5">{children}</span>
    </li>
  )
}

/** Install Veridom as an app: one tap where the browser allows it, short steps where it doesn't. */
export function InstallApp() {
  const { installed, canPrompt, platform, install } = usePwaInstall()
  const [busy, setBusy] = React.useState(false)

  const run = async () => {
    setBusy(true)
    try {
      const outcome = await install()
      if (outcome === "accepted") toast.success("Veridom is being installed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-labelledby="install-title"
      className="relative isolate overflow-hidden rounded-2xl bg-card p-5 shadow-md sm:p-6"
    >
      <PatternBg className="-z-10 [mask-image:linear-gradient(to_left,black,transparent_70%)] object-right opacity-20 dark:opacity-40" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Smartphone className="size-5" aria-hidden />
            </span>
            <div>
              <h2
                id="install-title"
                className="text-lg font-semibold tracking-tight"
              >
                {installed ? "Veridom is installed" : "Get the Veridom app"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {installed
                  ? "You're using Veridom as an app on this device."
                  : "Add Veridom to your home screen for a faster, app-like experience. No app store needed."}
              </p>
            </div>
          </div>

          {!installed ? (
            <ul className="grid gap-2 text-sm">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          ) : null}

          {installed ? (
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <BadgeCheck className="size-4" aria-hidden /> Installed
            </p>
          ) : canPrompt ? (
            <Button size="lg" className="w-fit" onClick={run} disabled={busy}>
              <Download /> Install app
            </Button>
          ) : platform === "ios-safari" ? (
            <ol className="flex flex-col gap-2.5 rounded-xl border bg-background/70 p-4">
              <Step n={1}>
                Tap <Share className="size-4 text-primary" aria-label="Share" />{" "}
                Share in Safari&apos;s toolbar
              </Step>
              <Step n={2}>
                Choose{" "}
                <PlusSquare className="size-4 text-primary" aria-hidden />
                <strong>Add to Home Screen</strong>
              </Step>
              <Step n={3}>
                Tap <strong>Add</strong>
              </Step>
            </ol>
          ) : platform === "ios-other" ? (
            <p className="rounded-xl border bg-background/70 p-4 text-sm">
              On iPhone and iPad, installing works from <strong>Safari</strong>.
              Open this page in Safari, then use Share, then Add to Home Screen.
            </p>
          ) : (
            <p className="flex items-start gap-2 rounded-xl border bg-background/70 p-4 text-sm text-muted-foreground">
              <MoreVertical
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                Open your browser&apos;s menu and choose{" "}
                <strong className="text-foreground">Install app</strong> or{" "}
                <strong className="text-foreground">Add to Home screen</strong>.
              </span>
            </p>
          )}
        </div>

        <div aria-hidden className="mx-auto hidden shrink-0 sm:block">
          <div className="relative grid h-44 w-24 place-items-center rounded-[1.6rem] border-4 border-foreground/80 bg-background shadow-xl">
            <span className="absolute top-1.5 h-1 w-8 rounded-full bg-foreground/20" />
            <div className="grid size-14 place-items-center rounded-2xl bg-neutral-900 shadow-md">
              <Logo className="size-9" />
            </div>
            <span className="absolute bottom-3 text-[10px] font-semibold tracking-wide">
              Veridom
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
