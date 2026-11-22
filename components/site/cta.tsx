import Link from "next/link"

import { Button } from "@/components/ui/button"

import { IconMask } from "@/components/landing/icon-mask"

export function Cta() {
  return (
    <section
      id="about"
      className="relative isolate scroll-mt-4 overflow-hidden bg-muted/60"
    >
      <IconMask
        src="/landing/cta-art-left.svg"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[258px] w-[474px] text-foreground/[0.06]"
      />
      <IconMask
        src="/landing/cta-art-right.svg"
        className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[310px] w-[569px] -scale-y-100 rotate-180 text-foreground/[0.06]"
      />
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-24 lg:px-12 lg:py-12">
        <div className="flex max-w-3xl flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start Your Real Estate Journey Today
          </h2>
          <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
            Your dream property is just a click away. Whether you&apos;re
            looking for a new home, a strategic investment, or expert real
            estate advice, Veridom is here to assist you every step of the way.
            Take the first step towards your real estate goals and explore our
            available properties or get in touch with our team for personalized
            assistance.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0 self-start">
          <Link href="#properties">Explore Properties</Link>
        </Button>
      </div>
    </section>
  )
}
