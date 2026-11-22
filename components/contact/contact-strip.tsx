import Image from "next/image"
import Link from "next/link"

import { IconMask } from "@/components/landing/icon-mask"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const tile =
  "group relative flex flex-col items-center gap-2.5 rounded-xl bg-card px-3 py-4 text-center outline-none transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-3 sm:px-4 sm:py-5"

function Ring({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-primary/50 p-1.5">
      <span className="block rounded-full border border-primary/50 p-2.5">
        {children}
      </span>
    </span>
  )
}

function Corner() {
  return (
    <IconMask
      src="/landing/icon-arrow.svg"
      className="absolute top-2.5 right-2.5 size-4 text-muted-foreground transition-colors group-hover:text-primary sm:top-3 sm:right-3 sm:size-5"
    />
  )
}

const links = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Facebook", href: "#" },
]

export function ContactStrip() {
  return (
    <section
      aria-label="Contact details"
      className="grid grid-cols-2 gap-2.5 bg-muted/60 p-2.5 sm:gap-3 sm:p-3 lg:grid-cols-4"
    >
      <Link href="mailto:info@veridom.com" className={tile}>
        <Ring>
          <Image
            src="/contact/icon-mail.svg"
            alt=""
            width={26}
            height={26}
            unoptimized
          />
        </Ring>
        <span className="text-sm font-semibold break-all sm:text-base lg:text-lg">
          info@veridom.com
        </span>
        <Corner />
      </Link>
      <Link href="tel:+11234567890" className={tile}>
        <Ring>
          <Image
            src="/contact/icon-phone.svg"
            alt=""
            width={26}
            height={26}
            unoptimized
          />
        </Ring>
        <span className="text-sm font-semibold sm:text-base lg:text-lg">
          +1 (123) 456-7890
        </span>
        <Corner />
      </Link>
      <Link href="#offices" className={tile}>
        <Ring>
          <Image
            src="/contact/icon-pin.svg"
            alt=""
            width={26}
            height={26}
            unoptimized
          />
        </Ring>
        <span className="text-sm font-semibold sm:text-base lg:text-lg">
          Main Headquarters
        </span>
        <Corner />
      </Link>
      <div className={cn(tile, "hover:translate-y-0 hover:shadow-none")}>
        <Ring>
          <Logo className="size-[26px]" />
        </Ring>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold sm:text-base">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="underline underline-offset-2 hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Corner />
      </div>
    </section>
  )
}
