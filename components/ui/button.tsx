import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Launch UI structure with 3D variants: solid-colour variants carry a hard "edge"
// under the face (see `btn-3d` in globals.css) that sinks on press.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate,--tw-gradient-from,--tw-gradient-to] duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "btn-3d border-t-white/20 bg-linear-to-b from-[color-mix(in_oklab,var(--primary),white_16%)] to-primary text-primary-foreground [--edge-glow:color-mix(in_oklab,var(--primary)_60%,transparent)] [--edge:color-mix(in_oklab,var(--primary),black_42%)] hover:from-[color-mix(in_oklab,var(--primary),white_24%)]",
        secondary:
          "btn-3d bg-linear-to-b from-secondary to-[color-mix(in_oklab,var(--secondary),var(--foreground)_6%)] text-secondary-foreground [--edge:color-mix(in_oklab,var(--secondary),var(--foreground)_28%)] hover:from-[color-mix(in_oklab,var(--secondary),var(--foreground)_6%)]",
        outline:
          "btn-3d border-input bg-background text-foreground [--edge:color-mix(in_oklab,var(--foreground)_16%,transparent)] hover:bg-accent hover:text-accent-foreground",
        glow: "btn-3d glass-4 text-foreground [--edge-glow:color-mix(in_oklab,var(--primary)_45%,transparent)] [--edge:color-mix(in_oklab,var(--primary)_55%,transparent)] hover:glass-5",
        destructive:
          "btn-3d border-t-white/20 bg-linear-to-b from-[color-mix(in_oklab,var(--destructive),white_14%)] to-destructive text-white [--edge-glow:color-mix(in_oklab,var(--destructive)_55%,transparent)] [--edge:color-mix(in_oklab,var(--destructive),black_45%)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "font-medium text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 px-5",
        xl: "h-12 px-7 text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
