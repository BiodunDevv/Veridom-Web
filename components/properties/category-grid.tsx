import Image from "next/image"
import Link from "next/link"

import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { SectionPager } from "@/components/landing/section-pager"
import { Button } from "@/components/ui/button"

const categories = [
  {
    tag: "Coastal Escapes - Where Waves Beckon",
    name: "Seaside Serenity Villa",
    slug: "seaside-serenity-villa",
    blurb: "Wake up to the soothing melody of waves. This beachfront villa offers...",
    price: "$1,250,000",
    image: "/landing/property-1.png",
  },
  {
    tag: "Urban Oasis - Life in the Heart of the City",
    name: "Metropolitan Haven",
    slug: "metropolitan-haven",
    blurb: "Immerse yourself in the energy of the city. This modern apartment in the heart...",
    price: "$650,000",
    image: "/landing/property-2.png",
  },
  {
    tag: "Countryside Charm - Escape to Nature's Embrace",
    name: "Rustic Retreat Cottage",
    slug: "rustic-retreat-cottage",
    blurb: "Find tranquility in the countryside. This charming cottage is nestled amidst rolling hills...",
    price: "$350,000",
    image: "/landing/property-3.png",
    tint: "hue-rotate-[-135deg]",
  },
]

export function CategoryGrid() {
  return (
    <Section id="categories">
      <SectionHeading
        title="Discover a World of Possibilities"
        description="Our portfolio of properties is as diverse as your dreams. Explore the following categories to find the perfect property that resonates with your vision of home"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((item) => (
          <article key={item.name} className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-md lg:p-5">
            <div className="relative h-48 overflow-hidden rounded-lg lg:h-52">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className={`object-cover ${item.tint ?? ""}`}
              />
            </div>
            <span className="self-start rounded-full bg-secondary px-3 py-1.5 text-xs font-medium sm:text-sm">
              {item.tag}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-sm leading-relaxed font-medium text-muted-foreground">
                {item.blurb}{" "}
                <Link href="#" className="text-foreground underline underline-offset-2">
                  Read More
                </Link>
              </p>
            </div>
            <div className="mt-auto flex items-end gap-6">
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-muted-foreground">Price</span>
                <span className="text-xl font-semibold">{item.price}</span>
              </div>
              <Button asChild className="flex-1">
                <Link href={`/properties/${item.slug}`}>View Property Details</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
      <SectionPager total={10} />
    </Section>
  )
}
