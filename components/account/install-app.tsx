"use client"

import * as React from "react"
import {
  BadgeCheck,
  Download,
  MoreVertical,
  PlusSquare,
  Share,
} from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "@/hooks/use-pwa-install"

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
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#1f5a3a] to-[#0c2618] shadow-sm"
        >
          <Logo className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="install-title" className="truncate text-sm font-semibold">
            {installed ? "Veridom is installed" : "Get the Veridom app"}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {installed
              ? "You're using Veridom as an app here."
              : "Faster, full screen, one tap away."}
          </p>
        </div>
        {installed ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <BadgeCheck className="size-3.5" aria-hidden /> Installed
          </span>
        ) : canPrompt ? (
          <Button size="sm" className="shrink-0" onClick={run} disabled={busy}>
            <Download /> Install
          </Button>
        ) : null}
      </div>

      {installed || canPrompt ? null : platform === "ios-safari" ? (
        <ol className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3">
          <Step n={1}>
            Tap <Share className="size-4 text-primary" aria-label="Share" />{" "}
            Share in Safari&apos;s toolbar
          </Step>
          <Step n={2}>
            Choose <PlusSquare className="size-4 text-primary" aria-hidden />
            <strong>Add to Home Screen</strong>
          </Step>
          <Step n={3}>
            Tap <strong>Add</strong>
          </Step>
        </ol>
      ) : platform === "ios-other" ? (
        <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
          On iPhone and iPad, open this page in{" "}
          <strong className="text-foreground">Safari</strong>, then Share, then
          Add to Home Screen.
        </p>
      ) : (
        <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
          <MoreVertical
            className="mt-0.5 size-3.5 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            Open your browser&apos;s menu and choose{" "}
            <strong className="text-foreground">Install app</strong> or{" "}
            <strong className="text-foreground">Add to Home screen</strong>.
          </span>
        </p>
      )}
    </section>
  )
}
