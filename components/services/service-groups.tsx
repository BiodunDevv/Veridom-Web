import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"

import { ServiceCallout, ServiceCard, type Service } from "./service-card"

const selling: Service[] = [
  {
    title: "Valuation Mastery",
    icon: "/services/valuation.svg",
    body: "Discover the true worth of your property with our expert valuation services.",
  },
  {
    title: "Strategic Marketing",
    icon: "/services/marketing.svg",
    body: "Selling a property requires more than just a listing; it demands a strategic marketing approach.",
  },
  {
    title: "Negotiation Wizardry",
    icon: "/services/negotiation.svg",
    body: "Negotiating the best deal is an art, and our negotiation experts are masters of it.",
  },
  {
    title: "Closing Success",
    icon: "/services/closing.svg",
    body: "A successful sale is not complete until the closing. We guide you through the intricate closing process.",
  },
]

const management: Service[] = [
  {
    title: "Tenant Harmony",
    icon: "/services/tenant.svg",
    body: "Our Tenant Management services ensure that your tenants have a smooth and reducing vacancies.",
  },
  {
    title: "Maintenance Ease",
    icon: "/services/maintenance.svg",
    body: "Say goodbye to property maintenance headaches. We handle all aspects of property upkeep.",
  },
  {
    title: "Financial Peace of Mind",
    icon: "/services/financial.svg",
    body: "Managing property finances can be complex. Our financial experts take care of rent collection",
  },
  {
    title: "Legal Guardian",
    icon: "/services/legal.svg",
    body: "Stay compliant with property laws and regulations effortlessly.",
  },
]

const investing: Service[] = [
  {
    title: "Market Insight",
    icon: "/services/market.svg",
    body: "Stay ahead of market trends with our expert Market Analysis. We provide in-depth insights into real estate market conditions",
  },
  {
    title: "ROI Assessment",
    icon: "/services/roi.svg",
    body: "Make investment decisions with confidence. Our ROI Assessment services evaluate the potential returns on your investments",
  },
  {
    title: "Customized Strategies",
    icon: "/services/custom.svg",
    body: "Every investor is unique, and so are their goals. We develop Customized Investment Strategies tailored to your specific needs",
  },
  {
    title: "Diversification Mastery",
    icon: "/services/diversify.svg",
    body: "Diversify your real estate portfolio effectively. Our experts guide you in spreading your investments across various property types and locations",
  },
]

/** Three cards on top, then one card beside a call-out. */
function FeaturedGroup({
  id,
  title,
  description,
  services,
  calloutTitle,
  calloutBody,
}: {
  id: string
  title: string
  description: string
  services: Service[]
  calloutTitle: string
  calloutBody: string
}) {
  const [a, b, c, d] = services
  return (
    <Section id={id}>
      <SectionHeading title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        <ServiceCard service={a} />
        <ServiceCard service={b} />
        <ServiceCard service={c} className="md:col-span-2 lg:col-span-1" />
        <ServiceCard service={d} />
        <ServiceCallout
          title={calloutTitle}
          body={calloutBody}
          className="md:col-span-1 lg:col-span-2"
        />
      </div>
    </Section>
  )
}

export function SellingServices() {
  return (
    <FeaturedGroup
      id="unlock-value"
      title="Unlock Property Value"
      description="Selling your property should be a rewarding experience, and at Veridom, we make sure it is. Our Property Selling Service is designed to maximize the value of your property, ensuring you get the best deal possible. Explore the categories below to see how we can help you at every step of your selling journey"
      services={selling}
      calloutTitle="Unlock the Value of Your Property Today"
      calloutBody="Ready to unlock the true value of your property? Explore our Property Selling Service categories and let us help you achieve the best deal possible for your valuable asset."
    />
  )
}

export function ManagementServices() {
  return (
    <FeaturedGroup
      id="property-management"
      title="Effortless Property Management"
      description="Owning a property should be a pleasure, not a hassle. Veridom's Property Management Service takes the stress out of property ownership, offering comprehensive solutions tailored to your needs. Explore the categories below to see how we can make property management effortless for you"
      services={management}
      calloutTitle="Experience Effortless Property Management"
      calloutBody="Ready to experience hassle-free property management? Explore our Property Management Service categories and let us handle the complexities while you enjoy the benefits of property ownership."
    />
  )
}

export function InvestmentServices() {
  return (
    <Section id="smart-investments">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-12">
        <div className="flex flex-col gap-6 lg:gap-8">
          <SectionHeading
            title="Smart Investments, Informed Decisions"
            description="Building a real estate portfolio requires a strategic approach. Veridom's Investment Advisory Service empowers you to make smart investments and informed decisions."
          />
          <ServiceCallout
            stacked
            title="Unlock Your Investment Potential"
            body="Explore our Property Management Service categories and let us handle the complexities while you enjoy the benefits of property ownership."
          />
        </div>
        <div className="grid gap-4 rounded-xl bg-secondary p-2.5 sm:grid-cols-2">
          {investing.map((service) => (
            <ServiceCard
              key={service.title}
              service={service}
              className="shadow-none"
            />
          ))}
        </div>
      </div>
    </Section>
  )
}
