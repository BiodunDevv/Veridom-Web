"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { IconMask } from "@/components/landing/icon-mask"
import { Section } from "@/components/landing/section"
import { Field, inputClass } from "@/components/site/field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { type Property } from "@/lib/data/properties"
import { cn } from "@/lib/utils"

export function PropertyInquiry({ property }: { property: Property }) {
  const [agreed, setAgreed] = React.useState(false)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("Thanks! Our team will be in touch shortly.")
    event.currentTarget.reset()
    setAgreed(false)
  }

  return (
    <Section id="inquire">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-5xl">
            Inquire About {property.name}
          </h2>
          <p className="text-sm leading-relaxed font-medium text-muted-foreground sm:text-base lg:text-lg">
            Interested in this property? Fill out the form below, and our real estate experts will get back to you with more details, including scheduling a viewing and answering any questions you may have.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6 rounded-xl bg-card p-5 shadow-md sm:p-8 lg:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First Name" htmlFor="pi-first">
              <input id="pi-first" name="firstName" required placeholder="Enter First Name" className={inputClass} />
            </Field>
            <Field label="Last Name" htmlFor="pi-last">
              <input id="pi-last" name="lastName" required placeholder="Enter Last Name" className={inputClass} />
            </Field>
            <Field label="Email" htmlFor="pi-email">
              <input id="pi-email" name="email" type="email" required placeholder="Enter your Email" className={inputClass} />
            </Field>
            <Field label="Phone" htmlFor="pi-phone">
              <input id="pi-phone" name="phone" type="tel" placeholder="Enter Phone Number" className={inputClass} />
            </Field>
            <Field label="Selected Property" htmlFor="pi-property" className="sm:col-span-2">
              <div className="relative">
                <input
                  id="pi-property"
                  name="property"
                  readOnly
                  value={`${property.name}, ${property.location}`}
                  className={cn(inputClass, "pr-12 text-base")}
                />
                <IconMask
                  src="/property/icon-pin.svg"
                  className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2"
                />
              </div>
            </Field>
            <Field label="Message" htmlFor="pi-message" className="sm:col-span-2">
              <textarea
                id="pi-message"
                name="message"
                rows={5}
                placeholder="Enter your Message here.."
                className={cn(inputClass, "h-auto min-h-36 resize-y py-3")}
              />
            </Field>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} aria-label="Agree to terms" />
              <span>
                I agree with{" "}
                <Link href="#" className="underline underline-offset-2">Terms of Use</Link> and{" "}
                <Link href="#" className="underline underline-offset-2">Privacy Policy</Link>
              </span>
            </label>
            <Button type="submit" size="xl" disabled={!agreed} className="w-full sm:w-auto">
              Send Your Message
            </Button>
          </div>
        </form>
      </div>
    </Section>
  )
}
