import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { Button } from "@/components/ui/button"
import { type Property, estimateCosts, usd } from "@/lib/data/properties"

type Item = { label: string; value: string; note?: string }

function Fee({ item }: { item: Item }) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:gap-3">
      <p className="text-sm font-medium text-muted-foreground sm:text-base">{item.label}</p>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <p className="text-lg font-semibold sm:text-xl">{item.value}</p>
        {item.note ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
            {item.note}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function FeeGroup({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:p-10">
      <div className="flex items-center justify-between gap-4 border-b pb-4 sm:pb-6">
        <h3 className="text-xl font-semibold sm:text-2xl">{title}</h3>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 sm:gap-x-10">
        {items.map((item) => (
          <div key={item.label} className="border-b last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
            <Fee item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function Pricing({ property }: { property: Property }) {
  const c = estimateCosts(property.price)

  return (
    <Section id="pricing" className="bg-muted/60">
      <SectionHeading
        title="Comprehensive Pricing Details"
        description={`At Veridom, transparency is key. We want you to have a clear understanding of all costs associated with your property investment. Below, we break down the pricing for ${property.name} to help you make an informed decision`}
      />
      <div className="flex flex-col gap-3 rounded-xl bg-secondary px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-10 sm:py-6">
        <p className="text-lg font-semibold sm:text-xl">Note</p>
        <span className="hidden h-8 w-px bg-border sm:block" />
        <p className="text-sm font-medium text-muted-foreground sm:text-base">
          The figures provided above are estimates and may vary depending on the property, location, and individual circumstances.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <div className="flex flex-col leading-tight">
          <span className="text-base font-medium text-muted-foreground sm:text-lg">Listing Price</span>
          <span className="text-3xl font-semibold sm:text-4xl">{usd.format(property.price)}</span>
        </div>
        <div className="flex flex-col gap-5 lg:gap-8">
          <FeeGroup
            title="Additional Fees"
            items={[
              { label: "Property Transfer Tax", value: usd.format(c.transferTax), note: "Based on the sale price and local regulations" },
              { label: "Legal Fees", value: usd.format(c.legal), note: "Approximate cost for legal services, including title transfer" },
              { label: "Home Inspection", value: usd.format(c.inspection), note: "Recommended for due diligence" },
              { label: "Property Insurance", value: usd.format(c.insurance), note: "Annual cost for comprehensive property insurance" },
              { label: "Mortgage Fees", value: "Varies", note: "If applicable, consult with your lender for specific details" },
            ]}
          />
          <FeeGroup
            title="Monthly Costs"
            items={[
              { label: "Property Taxes", value: usd.format(c.monthlyTax), note: "Approximate monthly property tax based on the sale price and local rates" },
              { label: "Homeowners' Association Fee", value: usd.format(c.hoa), note: "Monthly fee for common area maintenance and security" },
            ]}
          />
          <FeeGroup
            title="Total Initial Costs"
            items={[
              { label: "Listing Price", value: usd.format(property.price) },
              { label: "Additional Fees", value: usd.format(c.additional), note: "Property transfer tax, legal fees, inspection, insurance" },
              { label: "Down Payment", value: usd.format(c.downPayment), note: "20%" },
              { label: "Mortgage Amount", value: usd.format(c.mortgage), note: "If applicable" },
            ]}
          />
          <FeeGroup
            title="Monthly Expenses"
            items={[
              { label: "Property Taxes", value: usd.format(c.monthlyTax) },
              { label: "Homeowners' Association Fee", value: usd.format(c.hoa) },
              { label: "Mortgage Payment", value: "Varies based on terms and interest rate", note: "If applicable" },
              { label: "Property Insurance", value: usd.format(c.monthlyInsurance), note: "Approximate monthly cost" },
            ]}
          />
        </div>
      </div>
    </Section>
  )
}
