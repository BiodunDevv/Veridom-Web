import Image from "next/image"

import { Section } from "@/components/landing/section"

const photos = [
  { src: "/contact/gallery-1.png", alt: "Open-plan office desks" },
  { src: "/contact/gallery-2.png", alt: "The Veridom team" },
  { src: "/contact/gallery-3.png", alt: "Team meeting around a table" },
  { src: "/contact/gallery-4.png", alt: "Advisors posing together" },
  { src: "/contact/gallery-5.png", alt: "Advisors smiling" },
  { src: "/contact/gallery-6.png", alt: "Client handshake" },
]

function Photo({ index, className }: { index: number; className?: string }) {
  const photo = photos[index]
  return (
    <div className={`relative overflow-hidden rounded-lg ${className ?? ""}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover"
      />
    </div>
  )
}

export function Gallery() {
  return (
    <Section id="gallery">
      <div className="grid gap-3 rounded-xl bg-secondary p-3 sm:gap-4 sm:p-5 lg:grid-cols-2 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-rows-2">
          <Photo index={0} className="col-span-2 h-40 sm:h-56 lg:h-auto" />
          <Photo index={2} className="col-span-2 h-40 sm:h-56 lg:h-auto" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-rows-[1fr_1fr]">
          <Photo index={1} className="col-span-2 h-40 sm:h-56 lg:h-auto" />
          <Photo index={3} className="h-36 sm:h-48 lg:h-auto" />
          <Photo index={4} className="h-36 sm:h-48 lg:h-auto" />
        </div>
        <div className="flex flex-col justify-center gap-3 py-2 lg:pr-5">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Explore Veridom&apos;s World
          </h2>
          <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
            Step inside the world of Veridom, where professionalism meets warmth, and expertise
            meets passion. Our gallery offers a glimpse into our team and workspaces, inviting you
            to get to know us better.
          </p>
        </div>
        <Photo index={5} className="h-56 sm:h-64" />
      </div>
    </Section>
  )
}
