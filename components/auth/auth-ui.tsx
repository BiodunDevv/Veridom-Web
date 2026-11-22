"use client"

import * as React from "react"
import { Eye, EyeOff, Loader2, type LucideIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export function AuthHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm text-balance text-foreground/55">{description}</p>
    </div>
  )
}

type AuthInputProps = React.ComponentProps<"input"> & {
  icon: LucideIcon
  label: string
}

export function AuthInput({
  icon: Icon,
  label,
  id,
  className,
  type,
  ...props
}: AuthInputProps) {
  const [visible, setVisible] = React.useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <InputGroup
        className={cn(
          "h-11 rounded-xl bg-background shadow-xs transition-colors hover:border-foreground/25 dark:bg-foreground/[0.04]",
          "has-[[data-slot=input-group-control]:focus-visible]:border-primary/70 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/20",
          className
        )}
      >
        <InputGroupAddon align="inline-start" className="pl-3.5">
          <Icon aria-hidden className="size-[18px] text-foreground/45" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type={isPassword && visible ? "text" : type}
          placeholder={label}
          className={cn(
            "h-full text-[15px] placeholder:text-foreground/40 md:text-[15px]",
            isPassword &&
              !visible &&
              "[&:not(:placeholder-shown)]:text-xl [&:not(:placeholder-shown)]:tracking-[0.18em] md:[&:not(:placeholder-shown)]:text-xl"
          )}
          {...props}
        />
        {isPassword ? (
          <InputGroupAddon align="inline-end" className="pr-2">
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              className="rounded-lg text-foreground/45 hover:text-foreground"
            >
              {visible ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  )
}

type AuthButtonProps = React.ComponentProps<"button"> & {
  loading?: boolean
}

export function AuthButton({
  loading,
  disabled,
  className,
  children,
  ...props
}: AuthButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant: "default", size: "lg" }),
        "h-11 w-full rounded-xl text-[15px]",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

export function AuthOutlineButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-11 flex-1 rounded-xl text-[15px]",
        className
      )}
      {...props}
    />
  )
}

export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs tracking-wide text-foreground/45 uppercase">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export function AuthNotice({
  tone = "info",
  title,
  children,
  icon: Icon,
}: {
  tone?: "info" | "error"
  title: string
  children: React.ReactNode
  icon?: LucideIcon
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted/60 text-foreground/80"
      )}
    >
      {Icon ? <Icon aria-hidden className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="grid gap-0.5">
        <p className="font-medium text-foreground">{title}</p>
        <p
          className={
            tone === "error" ? "text-destructive/80" : "text-foreground/60"
          }
        >
          {children}
        </p>
      </div>
    </div>
  )
}

export function AuthFooterText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-center text-sm text-foreground/55", className)}
      {...props}
    />
  )
}

export const authLinkClass =
  "text-foreground/80 underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/70"

export function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.6 4.1-5.35 4.1a5.9 5.9 0 0 1 0-11.8c1.87 0 3.12.8 3.84 1.48l2.62-2.52C17.45 3.78 15.9 3 12 3a9 9 0 1 0 0 18c5.2 0 8.64-3.65 8.64-8.8 0-.6-.07-1.05-.15-1.5z" />
    </svg>
  )
}

export function GithubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  )
}
