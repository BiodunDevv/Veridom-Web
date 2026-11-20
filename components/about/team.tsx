import Image from "next/image"
import Link from "next/link"

import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { Button } from "@/components/ui/button"

const team = [
  { name: "Max Mitchell", role: "Founder", photo: "/about/team-1.png" },
  { name: "Sarah Johnson", role: "Chief Real Estate Officer", photo: "/about/team-2.png" },
  { name: "David Brown", role: "Head of Property Management", photo: "/about/team-3.png" },
  { name: "Michael Turner", role: "Legal Counsel", photo: "/about/team-4.png" },
]

export function Team() {
  return (
    <Section id="team" className="bg-muted/60">
      <SectionHeading
        title="Meet the Veridom Team"
        description="At Veridom, our success is driven by the dedication and expertise of our team. Get to know the people behind our mission to make your real estate dreams a reality."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
        {team.map((member) => (
          <article key={member.name} className="relative flex flex-col gap-6 rounded-xl bg-card p-4 pb-5 shadow-md lg:p-5">
            <div className="relative h-60 overflow-hidden rounded-lg lg:h-64">
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-top"
              />
            </div>
            <Button
              asChild
              size="icon-lg"
              className="absolute top-[13.5rem] left-1/2 w-20 -translate-x-1/2 rounded-full lg:top-[14.5rem]"
            >
              <Link href="#" aria-label={`${member.name} on Twitter`}>
                <IconMask src="/about/icon-twitter.svg" className="size-5" />
              </Link>
            </Button>
            <div className="mt-2 flex flex-col items-center gap-1 text-center">
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-sm font-medium text-muted-foreground sm:text-base">{member.role}</p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-secondary py-2 pr-2 pl-5">
              <span className="flex-1 text-sm font-medium sm:text-base">Say Hello 👋</span>
              <Button asChild size="icon" className="rounded-full">
                <Link href="/contact" aria-label={`Contact ${member.name}`}>
                  <IconMask src="/about/icon-send.svg" className="size-5" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
