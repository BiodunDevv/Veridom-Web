import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"

const achievements = [
  {
    title: "3+ Years of Excellence",
    body: "With over 3 years in the industry, we've amassed a wealth of knowledge and experience, becoming a go-to resource for all things real estate.",
  },
  {
    title: "Happy Clients",
    body: "Our greatest achievement is the satisfaction of our clients. Their success stories fuel our passion for what we do.",
  },
  {
    title: "Industry Recognition",
    body: "We've earned the respect of our peers and industry leaders, with accolades and awards that reflect our commitment to excellence.",
  },
]

export function Achievements() {
  return (
    <Section id="achievements" className="bg-muted/60">
      <SectionHeading
        title="Our Achievements"
        description="Our story is one of continuous growth and evolution. We started as a small team with big dreams, determined to create a real estate platform that transcended the ordinary."
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {achievements.map((item) => (
          <article
            key={item.title}
            className="flex flex-col gap-3 rounded-xl bg-card p-6 shadow-md lg:gap-5 lg:p-10"
          >
            <h3 className="text-xl font-semibold lg:text-2xl">{item.title}</h3>
            <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  )
}
