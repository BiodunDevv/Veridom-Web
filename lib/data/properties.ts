export type Property = {
  slug: string
  name: string
  location: string
  price: number
  beds: number
  baths: number
  areaSqFt: number
  description: string
  features: string[]
  images: string[]
  /** CSS filter class that keeps stock photography on-brand. */
  tint?: string
}

const villaImages = Array.from({ length: 10 }, (_, i) => `/property/villa-${i + 1}.png`)

export const properties: Property[] = [
  {
    slug: "seaside-serenity-villa",
    name: "Seaside Serenity Villa",
    location: "Malibu, California",
    price: 1_250_000,
    beds: 4,
    baths: 3,
    areaSqFt: 2500,
    description:
      "Discover your own piece of paradise with the Seaside Serenity Villa. With an open floor plan, breathtaking ocean views from every room, and direct access to a pristine sandy beach, this property is the epitome of coastal living.",
    features: [
      "Expansive oceanfront terrace for outdoor entertaining",
      "Gourmet kitchen with top-of-the-line appliances",
      "Private beach access for morning strolls and sunset views",
      "Master suite with a spa-inspired bathroom and ocean-facing balcony",
      "Private garage and ample storage space",
    ],
    images: villaImages,
  },
  {
    slug: "metropolitan-haven",
    name: "Metropolitan Haven",
    location: "Downtown District, Metropolis",
    price: 650_000,
    beds: 2,
    baths: 2,
    areaSqFt: 1400,
    description:
      "Immerse yourself in the energy of the city. This modern, fully-furnished apartment in the heart of downtown offers panoramic city views and everything you need for effortless urban living.",
    features: [
      "Floor-to-ceiling windows with panoramic city views",
      "Fully-furnished, move-in-ready interiors",
      "Secure building with concierge service",
      "Walking distance to dining, transit and shopping",
    ],
    images: ["/landing/property-2.png"],
  },
  {
    slug: "rustic-retreat-cottage",
    name: "Rustic Retreat Cottage",
    location: "Rolling Hills, Countryside",
    price: 350_000,
    beds: 3,
    baths: 3,
    areaSqFt: 1900,
    description:
      "Find tranquility in the countryside. This charming cottage is nestled amidst rolling hills, with room to breathe, a warm interior and views that change with every season.",
    features: [
      "Wood-burning fireplace in the open living room",
      "Wraparound porch overlooking the hills",
      "Mature garden with space for outdoor dining",
      "Quiet, gated community close to local amenities",
    ],
    images: ["/landing/property-3.png"],
    tint: "hue-rotate-[-135deg]",
  },
]

export function getProperty(slug: string) {
  return properties.find((property) => property.slug === slug)
}

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** Transparent estimates derived from the listing price. */
export function estimateCosts(price: number) {
  const transferTax = Math.round(price * 0.02)
  const legal = 3000
  const inspection = 500
  const insurance = 1200
  const additional = transferTax + legal + inspection + insurance
  const downPayment = Math.round(price * 0.2)
  return {
    transferTax,
    legal,
    inspection,
    insurance,
    additional,
    downPayment,
    mortgage: price - downPayment,
    monthlyTax: Math.round(price * 0.001),
    hoa: 300,
    monthlyInsurance: 100,
  }
}
