import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"

const steps = [
  {
    title: "Discover a World of Possibilities",
    body: "Your journey begins with exploring our carefully curated property listings. Use our intuitive search tools to filter properties based on your preferences, including location, type, size, and budget.",
  },
  {
    title: "Narrowing Down Your Choices",
    body: "Once you've found properties that catch your eye, save them to your account or make a shortlist. This allows you to compare and revisit your favorites as you make your decision.",
  },
  {
    title: "Personalized Guidance",
    body: "Have questions about a property or need more information? Our dedicated team of real estate experts is just a call or message away.",
  },
  {
    title: "See It for Yourself",
    body: "Arrange viewings of the properties you're interested in. We'll coordinate with the property owners and accompany you to ensure you get a firsthand look at your potential new home.",
  },
  {
    title: "Making Informed Decisions",
    body: "Before making an offer, our team will assist you with due diligence, including property inspections, legal checks, and market analysis. We want you to be fully informed and confident in your choice.",
  },
  {
    title: "Getting the Best Deal",
    body: "We'll help you negotiate the best terms and prepare your offer. Our goal is to secure the property at the right price and on favorable terms.",
  },
]

export function Process() {
  return (
    <Section id="process">
      <SectionHeading
        title="Navigating the Veridom Experience"
        description="At Veridom, we've designed a straightforward process to help you find and purchase your dream property with ease. Here's a step-by-step guide to how it all works."
      />
      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col">
            <p className="border-l-2 border-primary px-5 py-3 text-lg font-medium sm:text-xl">
              Step {String(index + 1).padStart(2, "0")}
            </p>
            <div className="flex flex-1 flex-col gap-3 rounded-tr-xl rounded-b-xl bg-linear-to-br from-primary/15 via-card to-card p-6 shadow-md lg:gap-5 lg:p-10">
              <h3 className="text-xl font-semibold lg:text-2xl">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
