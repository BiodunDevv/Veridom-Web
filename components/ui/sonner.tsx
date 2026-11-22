"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

/** Raised toast: a hard colored edge under the card, like the 3D buttons. Classes are literal so Tailwind can see them. */
const tones = {
  success:
    "[--edge:color-mix(in_oklab,var(--primary),black_35%)] [--glow:color-mix(in_oklab,var(--primary)_45%,transparent)] [--chip:color-mix(in_oklab,var(--primary)_16%,transparent)] [--ink:var(--primary)]",
  error:
    "[--edge:color-mix(in_oklab,var(--destructive),black_35%)] [--glow:color-mix(in_oklab,var(--destructive)_45%,transparent)] [--chip:color-mix(in_oklab,var(--destructive)_16%,transparent)] [--ink:var(--destructive)]",
  warning:
    "[--edge:color-mix(in_oklab,oklch(0.75_0.16_75),black_35%)] [--glow:color-mix(in_oklab,oklch(0.75_0.16_75)_45%,transparent)] [--chip:color-mix(in_oklab,oklch(0.75_0.16_75)_16%,transparent)] [--ink:oklch(0.62_0.16_75)]",
  info: "[--edge:color-mix(in_oklab,oklch(0.65_0.14_235),black_35%)] [--glow:color-mix(in_oklab,oklch(0.65_0.14_235)_45%,transparent)] [--chip:color-mix(in_oklab,oklch(0.65_0.14_235)_16%,transparent)] [--ink:oklch(0.55_0.14_235)]",
  loading:
    "[--edge:color-mix(in_oklab,var(--muted-foreground),black_20%)] [--chip:var(--muted)] [--ink:var(--muted-foreground)]",
}

const Toaster = (props: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      position="bottom-right"
      closeButton
      visibleToasts={4}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "group/toast pointer-events-auto relative flex w-full items-center gap-2.5 rounded-xl border bg-card py-2.5 pr-9 pl-2.5 text-card-foreground",
            "shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_25%,transparent),0_3px_0_0_var(--edge,color-mix(in_oklab,var(--border),var(--foreground)_20%)),0_16px_28px_-12px_var(--glow,transparent)]",
          ].join(" "),
          icon: "grid size-7 shrink-0 place-items-center rounded-full bg-[color:var(--chip,var(--muted))] text-[color:var(--ink,var(--foreground))]",
          content: "flex min-w-0 flex-col gap-px",
          title: "text-[13px] leading-tight font-semibold",
          description: "text-xs leading-snug text-muted-foreground",
          closeButton:
            "absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          actionButton:
            "ml-auto rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground",
          cancelButton:
            "rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground",
          success: tones.success,
          error: tones.error,
          warning: tones.warning,
          info: tones.info,
          loading: tones.loading,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
