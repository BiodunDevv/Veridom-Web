import type { Metadata } from "next"
import Link from "next/link"
import { EyeOff, Lock, UserCheck } from "lucide-react"

import { LegalPage } from "@/components/legal/legal-page"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Privacy Policy | Veridom",
  description:
    "What personal information Veridom collects, why we use it, who sees it and the choices you have.",
}

export default function PrivacyPage() {
  return (
    <SiteShell>
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        updated="22 November 2026"
        intro="This policy explains what personal information Veridom collects, why we use it, who can see it and the choices you have. We keep it plain on purpose."
        other={{ href: "/terms", label: "Read the Terms" }}
        highlights={[
          {
            icon: <EyeOff className="size-5" />,
            title: "Documents stay private",
            text: "Ownership documents are only opened by the Veridom team.",
          },
          {
            icon: <Lock className="size-5" />,
            title: "We never store card details",
            text: "Payments are handled by our payment provider.",
          },
          {
            icon: <UserCheck className="size-5" />,
            title: "You are in control",
            text: "You can ask to see, fix or delete your information.",
          },
        ]}
        sections={[
          {
            id: "who",
            title: "Who we are",
            content: (
              <p>
                Veridom is the controller of the personal information described
                here. We handle it in line with the Nigeria Data Protection Act
                2023 and other applicable law. You can reach us at{" "}
                <a href="mailto:hello@veridom.app">hello@veridom.app</a>.
              </p>
            ),
          },
          {
            id: "collect",
            title: "What we collect",
            content: (
              <>
                <ul>
                  <li>
                    <strong>Account details:</strong> your name, email address,
                    phone number (optional) and password, which we store in
                    protected form.
                  </li>
                  <li>
                    <strong>Activity:</strong> viewings you book, reservations,
                    deals, messages and how you use the platform.
                  </li>
                  <li>
                    <strong>Listings:</strong> property details, photos and
                    ownership documents that listers upload.
                  </li>
                  <li>
                    <strong>Payments:</strong> references, amounts and status.
                    Card details go straight to our payment provider and never
                    reach our servers.
                  </li>
                  <li>
                    <strong>Device and security data:</strong> sign-in times,
                    browser type and approximate location, used to protect your
                    account.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: "use",
            title: "How we use it",
            content: (
              <>
                <ul>
                  <li>To create your account and verify your email.</li>
                  <li>To run viewings, reservations, payments and payouts.</li>
                  <li>
                    To review listings and documents so renters can trust what
                    they see.
                  </li>
                  <li>
                    To prevent fraud, keep the platform secure and settle
                    disputes.
                  </li>
                  <li>
                    To send service messages such as codes, receipts and
                    reminders.
                  </li>
                </ul>
                <p>
                  We rely on your agreement, on our need to provide the service
                  you asked for, on legal obligations and on our legitimate
                  interest in keeping Veridom safe.
                </p>
              </>
            ),
          },
          {
            id: "sharing",
            title: "Who sees your information",
            content: (
              <>
                <ul>
                  <li>
                    <strong>Listers</strong> see the details they need to
                    arrange a viewing or deal with you, such as your first name.
                    Full contact details are shared only when needed for a
                    confirmed deal.
                  </li>
                  <li>
                    <strong>Service providers</strong> that help us run Veridom,
                    such as payments, email and file storage, process data on
                    our instructions.
                  </li>
                  <li>
                    <strong>Authorities</strong> when the law requires it.
                  </li>
                </ul>
                <p>We do not sell your personal information.</p>
              </>
            ),
          },
          {
            id: "documents",
            title: "Ownership documents",
            content: (
              <p>
                Documents uploaded to prove ownership are private. They are
                scanned for safety, can only be opened by the Veridom team, and
                every time one is opened it is recorded. They are deleted
                automatically about 90 days after the listing is approved or
                rejected.
              </p>
            ),
          },
          {
            id: "cookies",
            title: "Cookies",
            content: (
              <p>
                We use essential cookies to keep you signed in and your account
                secure. Without them the platform will not work properly. We do
                not use advertising cookies. If we add analytics in future, we
                will ask for your choice first.
              </p>
            ),
          },
          {
            id: "retention",
            title: "How long we keep it",
            content: (
              <p>
                We keep information for as long as your account is open and as
                long as needed to meet legal, tax, accounting and dispute
                requirements. After that we delete or anonymise it.
              </p>
            ),
          },
          {
            id: "security",
            title: "Keeping it safe",
            content: (
              <p>
                We use encryption in transit, restricted access to private
                files, rate limits and security checks to protect your
                information. No system is perfectly secure, so please use a
                strong, unique password and keep your codes private.
              </p>
            ),
          },
          {
            id: "rights",
            title: "Your rights",
            content: (
              <>
                <p>Under Nigerian law you can ask us to:</p>
                <ul>
                  <li>Tell you what personal information we hold about you.</li>
                  <li>Correct information that is wrong or incomplete.</li>
                  <li>
                    Delete your information, where we have no legal reason to
                    keep it.
                  </li>
                  <li>
                    Limit or object to certain uses, or give you a copy to move
                    elsewhere.
                  </li>
                </ul>
                <p>
                  To use a right, contact us. If you are unhappy with our
                  answer, you can complain to the Nigeria Data Protection
                  Commission.
                </p>
              </>
            ),
          },
          {
            id: "children",
            title: "Children",
            content: (
              <p>
                Veridom is for people aged 18 and over. We do not knowingly
                collect information from children.
              </p>
            ),
          },
          {
            id: "changes",
            title: "Changes to this policy",
            content: (
              <p>
                We may update this policy. For important changes we will tell
                you on the platform or by email, and the date at the top will
                change.
              </p>
            ),
          },
          {
            id: "contact",
            title: "Contact us",
            content: (
              <p>
                Questions or requests about your information? Email{" "}
                <a href="mailto:hello@veridom.app">hello@veridom.app</a> or use
                our <Link href="/contact#message">contact form</Link>.
              </p>
            ),
          },
        ]}
      />
    </SiteShell>
  )
}
