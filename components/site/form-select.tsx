import * as React from "react"

import { IconMask } from "@/components/landing/icon-mask"
import { cn } from "@/lib/utils"

type FormSelectProps = Omit<React.ComponentProps<"select">, "children"> & {
  placeholder: string
  options: readonly (string | { value: string; label: string })[]
  /** Optional leading icon (a downloaded SVG asset). */
  icon?: string
  wrapperClassName?: string
}

/** Native select with the design's chevron; accessible, keyboard- and mobile-friendly. */
export function FormSelect({
  placeholder,
  options,
  icon,
  className,
  wrapperClassName,
  value,
  defaultValue = "",
  ...props
}: FormSelectProps) {
  return (
    <div className={cn("relative flex items-center", wrapperClassName)}>
      {icon ? (
        <IconMask
          src={icon}
          className="pointer-events-none absolute left-3.5 size-5 text-muted-foreground"
        />
      ) : null}
      <select
        {...(value === undefined ? { defaultValue } : { value })}
        className={cn(
          "h-12 w-full appearance-none rounded-lg border border-input bg-secondary/60 pr-10 text-sm font-medium transition-colors outline-none invalid:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          icon ? "pl-11" : "pl-4",
          className
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const { value, label } =
            typeof option === "string"
              ? { value: option, label: option }
              : option
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      <IconMask
        src="/properties/icon-chevron.svg"
        className="pointer-events-none absolute right-3 size-5 text-muted-foreground"
      />
    </div>
  )
}
