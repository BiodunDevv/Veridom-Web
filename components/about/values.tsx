import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"

const values = [
  {
    title: "Trust",
    icon: "/about/value-star.svg",
    body: "Trust is the cornerstone of every successful real estate transaction.",
  },
  {
    title: "Excellence",
    icon: "/about/value-excellence.svg",
    body: "We set the bar high for ourselves. From the properties we list to the services we provide.",
  },
  {
    title: "Client-Centric",
    icon: "/about/value-clients.svg",
    body: "Your dreams and needs are at the center of our universe. We listen, understand.",
  },
  {
    title: "Our Commitment",
    icon: "/about/value-star.svg",
    body: "We are dedicated to providing you with the highest level of service, professionalism, and support.",
  },
]

export function Values() {
  return (
    <Section id="values">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-5xl">
            Our Values
          </h2>
          <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg">
            Our story is one of continuous growth and evolution. We started as a
            small team with big dreams, determined to create a real estate
            platform that transcended the ordinary.
          </p>
        </div>
        <div className="grid divide-y rounded-xl bg-card p-2 shadow-md sm:grid-cols-2 sm:divide-y-0 sm:p-4 lg:p-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`flex flex-col gap-3 p-4 sm:p-6 ${index % 2 === 1 ? "sm:border-l" : ""} ${index > 1 ? "sm:border-t" : ""}`}
            >
              <div className="flex items-center gap-3.5">
                <span className="grid size-14 shrink-0 place-items-center rounded-full border border-primary/60 bg-background text-primary">
                  <IconMask src={value.icon} className="size-7" />
                </span>
                <h3 className="text-lg font-semibold sm:text-xl">
                  {value.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
