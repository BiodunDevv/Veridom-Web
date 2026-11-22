import * as React from "react"

import { cn } from "@/lib/utils"

type LogoProps = React.SVGProps<SVGSVGElement> & {
  title?: string
}

function Logo({ className, title = "Veridom", style, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("size-12 shrink-0", className)}
      style={{
        color: "var(--primary)",
        ...style,
      }}
      {...props}
    >
      <title>{title}</title>
      <path
        d="M16.7856 28.3761C16.9688 25.1077 19.7654 22.6081 23.0338 22.7896C23.047 22.7912 23.0602 22.7912 23.0751 22.7929C24.4808 22.8275 25.837 23.3307 26.9243 24.2233C34.9775 31.6281 39.0445 42.4103 37.8896 53.2881C37.8896 53.7913 37.2445 53.7715 37.0828 53.2881C34.9049 45.8916 27.7113 37.3846 21.341 34.8454C18.4966 34.0205 16.6025 31.3328 16.7856 28.3761Z"
        fill="color-mix(in oklab, currentColor 70%, var(--chart-2) 30%)"
      />
      <path
        d="M71.9343 27.7713C71.7924 22.787 67.6362 18.8618 62.6519 19.0037C62.5149 19.007 62.3763 19.0136 62.2394 19.0252C51.3154 19.2661 36.6229 47.3821 45.0276 72.9194C45.0276 73.4424 45.6314 73.3434 45.6727 72.8187C46.8408 55.0426 57.5042 41.195 67.0967 35.7338C70.2266 34.3099 72.152 31.1008 71.9343 27.6707"
        fill="var(--chart-2)"
      />
      <path
        d="M12.0128 53.5092C12.2174 56.6011 14.8638 58.9589 17.959 58.8104C24.722 59.0513 31.2375 61.4139 36.5815 65.5618C36.9643 65.8852 37.0253 65.7631 36.7845 64.9167C34.93 58.4276 24.9926 47.5432 17.7775 47.5432C14.6493 47.4805 12.0639 49.9652 12.0012 53.0918C11.9979 53.2584 12.0012 53.4251 12.0128 53.5901"
        fill="var(--chart-1)"
      />
      <path
        d="M78.989 53.5092C78.7828 56.6011 76.138 58.9589 73.0428 58.8104C66.2798 59.0513 59.7643 61.4139 54.4186 65.5618C54.0358 65.8852 53.9764 65.7631 54.219 64.9167C56.0718 58.4276 66.0092 47.5432 73.2243 47.5432C76.3508 47.4805 78.9379 49.9652 79.0006 53.0918C79.0039 53.2584 79.0006 53.4251 78.989 53.5901"
        fill="color-mix(in oklab, var(--chart-3) 74%, currentColor 26%)"
      />
    </svg>
  )
}

/** The mark alone, sized for sidebars and compact UI. */
function LogoIcon({ className, ...props }: LogoProps) {
  return <Logo className={cn("size-6", className)} {...props} />
}

export { Logo, LogoIcon }
