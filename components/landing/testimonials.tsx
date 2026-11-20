import Image from "next/image"

import { Section } from "./section"
import { SectionHeading } from "./section-heading"
import { SectionPager } from "./section-pager"

const testimonials = [
  {
    title: "Exceptional Service!",
    quote:
      "Our experience with Veridom was outstanding. Their team's dedication and professionalism made finding our dream home a breeze. Highly recommended!",
    name: "Wade Warren",
    place: "USA, California",
    avatar: "/landing/client-1.png",
  },
  {
    title: "Efficient and Reliable",
    quote:
      "Veridom provided us with top-notch service. They helped us sell our property quickly and at a great price. We couldn't be happier with the results.",
    name: "Emelie Thomson",
    place: "USA, Florida",
    avatar: "/landing/client-2.png",
  },
  {
    title: "Trusted Advisors",
    quote:
      "The Veridom team guided us through the entire buying process. Their knowledge and commitment to our needs were impressive. Thank you for your support!",
    name: "John Mans",
    place: "USA, Nevada",
    avatar: "/landing/client-3.png",
  },
]

export function Testimonials() {
  return (
    <Section id="testimonials" className="bg-muted/60">
      <SectionHeading
        title="What Our Clients Say"
        description="Read the success stories and heartfelt testimonials from our valued clients. Discover why they chose Veridom for their real estate needs."
        action="View All Testimonials"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <figure key={item.name} className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-md lg:p-6">
            <div className="flex gap-1.5" role="img" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Image key={i} src="/landing/icon-star.svg" alt="" width={30} height={28} unoptimized />
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <blockquote className="text-sm leading-relaxed font-medium">{item.quote}</blockquote>
            </div>
            <figcaption className="mt-auto flex items-center gap-3">
              <Image
                src={item.avatar}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
              <span className="flex flex-col leading-snug">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.place}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <SectionPager total={10} />
    </Section>
  )
}
