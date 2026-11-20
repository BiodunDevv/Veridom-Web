"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { SectionHeading } from "@/components/landing/section-heading"
import { Field, inputClass } from "@/components/site/field"
import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const locations = ["Lagos", "Abuja", "Port Harcourt", "Ibadan"] as const
const types = ["Villa", "Apartment", "Townhouse", "Cottage"] as const
const counts = ["1", "2", "3", "4", "5+"] as const
const budgets = ["Under $300k", "$300k – $700k", "$700k – $1.5M", "$1.5M+"] as const

export function InquiryForm() {
  const [agreed, setAgreed] = React.useState(false)
  const [contact, setContact] = React.useState<"phone" | "email">("phone")

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("Thanks! Our team will be in touch shortly.")
    event.currentTarget.reset()
    setAgreed(false)
  }

  return (
    <Section id="inquiry">
      <SectionHeading
        title="Let's Make it Happen"
        description="Ready to take the first step toward your dream property? Fill out the form below, and our real estate wizards will work their magic to find your perfect match. Don't wait; let's embark on this exciting journey together."
      />
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-6 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:gap-8 lg:p-12"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <Field label="First Name" htmlFor="first-name">
            <input id="first-name" name="firstName" required placeholder="Enter First Name" className={inputClass} />
          </Field>
          <Field label="Last Name" htmlFor="last-name">
            <input id="last-name" name="lastName" required placeholder="Enter Last Name" className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" required placeholder="Enter your Email" className={inputClass} />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" type="tel" placeholder="Enter Phone Number" className={inputClass} />
          </Field>

          <Field label="Preferred Location" htmlFor="location">
            <FormSelect id="location" name="location" placeholder="Select Location" options={locations} />
          </Field>
          <Field label="Property Type" htmlFor="type">
            <FormSelect id="type" name="type" placeholder="Select Property Type" options={types} />
          </Field>
          <Field label="No. of Bathrooms" htmlFor="baths">
            <FormSelect id="baths" name="baths" placeholder="Select no. of Bathrooms" options={counts} />
          </Field>
          <Field label="No. of Bedrooms" htmlFor="beds">
            <FormSelect id="beds" name="beds" placeholder="Select no. of Bedrooms" options={counts} />
          </Field>

          <Field label="Budget" htmlFor="budget" className="sm:col-span-2">
            <FormSelect id="budget" name="budget" placeholder="Select Budget" options={budgets} />
          </Field>
          <Field label="Preferred Contact Method" className="sm:col-span-2">
            <div role="radiogroup" aria-label="Preferred contact method" className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "phone", icon: "/properties/icon-phone.svg", label: "Enter Your Number" },
                  { value: "email", icon: "/properties/icon-mail.svg", label: "Enter Your Email" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex h-12 cursor-pointer items-center gap-3 rounded-lg border bg-secondary/60 px-4 text-sm font-medium transition-colors dark:bg-input/30",
                    contact === option.value ? "border-primary" : "border-input"
                  )}
                >
                  <IconMask src={option.icon} className="size-5 text-muted-foreground" />
                  <span className="flex-1 text-muted-foreground">{option.label}</span>
                  <input
                    type="radio"
                    name="contactMethod"
                    value={option.value}
                    checked={contact === option.value}
                    onChange={() => setContact(option.value)}
                    className="size-4 accent-[var(--primary)]"
                  />
                </label>
              ))}
            </div>
          </Field>

          <Field label="Message" htmlFor="message" className="sm:col-span-2 lg:col-span-4">
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Enter your Message here.."
              className={cn(inputClass, "h-auto min-h-36 resize-y py-3")}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <Checkbox
              checked={agreed}
              onCheckedChange={(value) => setAgreed(value === true)}
              aria-label="Agree to terms"
            />
            <span>
              I agree with{" "}
              <Link href="#" className="underline underline-offset-2">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline underline-offset-2">
                Privacy Policy
              </Link>
            </span>
          </label>
          <Button type="submit" size="xl" disabled={!agreed} className="w-full sm:w-auto">
            Send Your Message
          </Button>
        </div>
      </form>
    </Section>
  )
}
