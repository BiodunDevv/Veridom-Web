"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheck, Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { PatternBg } from "@/components/ui/pattern-bg"
import { Section } from "@/components/landing/section"
import { Field, inputClass } from "@/components/site/field"
import { FormSelect } from "@/components/site/form-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const topics = [
  "Renting",
  "Buying",
  "Selling",
  "Investing",
  "Something else",
] as const
const locations = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Other",
] as const
const budgets = [
  "Under ₦5M",
  "₦5M to ₦20M",
  "₦20M to ₦100M",
  "Over ₦100M",
] as const

const next = [
  ["We read your message", "A real person reviews every request."],
  ["We match you", "You hear back with verified options or answers."],
  ["You choose", "Book a viewing or reserve when you are ready."],
] as const

export function InquiryForm() {
  const [agreed, setAgreed] = React.useState(false)
  const [topic, setTopic] = React.useState<(typeof topics)[number]>("Renting")
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    // No contact endpoint in the API yet: this confirms to the visitor only.
    await new Promise((resolve) => setTimeout(resolve, 900))
    setSending(false)
    setSent(true)
    toast.success("Message sent", {
      description: "Our team will be in touch within one working day.",
    })
  }

  return (
    <Section id="message" className="scroll-mt-28">
      <div className="grid overflow-hidden rounded-3xl bg-card shadow-md lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <aside className="relative isolate flex flex-col gap-6 overflow-hidden bg-panel p-6 text-panel-foreground sm:p-8 lg:p-10">
          <PatternBg className="-z-10 opacity-30 mix-blend-soft-light" />
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Let&apos;s make it happen
            </h2>
            <p className="text-sm leading-relaxed opacity-85">
              Tell us what you are looking for. The more you share, the better
              we can help.
            </p>
          </div>
          <ol className="flex flex-col gap-4">
            {next.map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-panel-foreground/15 text-sm font-semibold">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-sm opacity-80">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-auto text-xs opacity-75">
            Prefer to talk? Call +234 800 000 0000, Monday to Friday.
          </p>
        </aside>

        {sent ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center lg:p-12">
            <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
              <CircleCheck className="size-8" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-semibold tracking-tight">
                Thanks, we got your message
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                A member of the Veridom team will reply within one working day.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/properties">Browse properties</Link>
              </Button>
              <Button variant="outline" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10"
          >
            <Field label="What do you need help with?">
              <div
                role="radiogroup"
                aria-label="Topic"
                className="flex flex-wrap gap-2"
              >
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={topic === t}
                    onClick={() => setTopic(t)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      topic === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-accent"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" htmlFor="first-name">
                <input
                  id="first-name"
                  name="firstName"
                  required
                  autoComplete="given-name"
                  placeholder="Muhammed"
                  className={inputClass}
                />
              </Field>
              <Field label="Last name" htmlFor="last-name">
                <input
                  id="last-name"
                  name="lastName"
                  required
                  autoComplete="family-name"
                  placeholder="Abiodun"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Phone (optional)" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234 800 000 0000"
                  className={inputClass}
                />
              </Field>
              {topic === "Renting" || topic === "Buying" ? (
                <>
                  <Field label="Preferred location" htmlFor="location">
                    <FormSelect
                      id="location"
                      name="location"
                      placeholder="Select location"
                      options={locations}
                    />
                  </Field>
                  <Field label="Budget" htmlFor="budget">
                    <FormSelect
                      id="budget"
                      name="budget"
                      placeholder="Select budget"
                      options={budgets}
                    />
                  </Field>
                </>
              ) : null}
              <Field
                label="Message"
                htmlFor="message-text"
                className="sm:col-span-2"
              >
                <textarea
                  id="message-text"
                  name="message"
                  rows={5}
                  required
                  placeholder="Tell us a little about what you are looking for"
                  className={cn(inputClass, "h-auto min-h-32 resize-y py-3")}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                  aria-label="Agree to terms"
                />
                <span>
                  I agree with{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              <Button
                type="submit"
                size="xl"
                disabled={!agreed || sending}
                className="w-full sm:w-auto"
              >
                {sending ? <Loader2 className="animate-spin" /> : <Send />}
                Send message
              </Button>
            </div>
          </form>
        )}
      </div>
    </Section>
  )
}
