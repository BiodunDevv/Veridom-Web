import type { Metadata } from "next"

import { pageMetadata } from "@/lib/site"
import Link from "next/link"
import { BadgeCheck, Handshake, ShieldCheck } from "lucide-react"

import { LegalPage } from "@/components/legal/legal-page"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions | Veridom",
  description:
    "The rules for using Veridom to search, view, reserve and list verified properties in Nigeria.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <SiteShell>
      <LegalPage
        eyebrow="Legal"
        title="Terms and Conditions"
        updated="22 November 2026"
        intro="These terms explain how Veridom works for renters, buyers, listers and everyone else who uses our platform. Please read them before you create an account."
        other={{ href: "/privacy", label: "Read the Privacy Policy" }}
        highlights={[
          {
            icon: <BadgeCheck className="size-5" />,
            title: "Verified listings",
            text: "We review listings and their documents before they go live.",
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: "Payments held safely",
            text: "Reservation payments are held until move-in is confirmed.",
          },
          {
            icon: <Handshake className="size-5" />,
            title: "Clear responsibilities",
            text: "Each side knows what to expect from the other and from us.",
          },
        ]}
        sections={[
          {
            id: "about",
            title: "About Veridom",
            content: (
              <>
                <p>
                  Veridom is an online platform that connects people looking for
                  a home with owners, agents and companies who list properties
                  in Nigeria. We provide the tools to search, book viewings,
                  reserve and pay, and to manage listings.
                </p>
                <p>
                  Veridom is not the owner or landlord of the properties listed,
                  and it does not act as an estate agent unless we say so in
                  writing. Rental or sale agreements are made between the
                  customer and the lister.
                </p>
              </>
            ),
          },
          {
            id: "accounts",
            title: "Your account",
            content: (
              <>
                <p>
                  You need an account to book viewings, reserve a property or
                  list a property. To create one you must be at least 18 years
                  old and provide accurate details.
                </p>
                <ul>
                  <li>Verify your email address with the code we send you.</li>
                  <li>Keep your password and sign-in codes private.</li>
                  <li>
                    Tell us straight away if you think someone else has used
                    your account.
                  </li>
                </ul>
                <p>
                  You are responsible for what happens under your account. We
                  may limit or suspend an account that breaks these terms or
                  puts others at risk.
                </p>
              </>
            ),
          },
          {
            id: "listings",
            title: "Listings and verification",
            content: (
              <>
                <p>
                  Listers must describe a property honestly and may only list a
                  property they own or are authorised to list. Before a listing
                  goes live, our team reviews its details, photos and ownership
                  documents.
                </p>
                <p>
                  A &quot;Documents verified&quot; badge means our team checked
                  the documents supplied. It is not a guarantee of title, and we
                  encourage you to take your own legal advice before you commit
                  to a purchase.
                </p>
                <p>
                  We may reject, pause or remove a listing that is inaccurate,
                  incomplete or misleading. Editing key details such as the
                  address or location can send a live listing back to review.
                </p>
              </>
            ),
          },
          {
            id: "viewings",
            title: "Viewings",
            content: (
              <>
                <p>
                  You can request a viewing from a listing. The exact address
                  and the name of the person you will meet are shared once the
                  viewing is confirmed.
                </p>
                <ul>
                  <li>Check in when you arrive, within the time shown.</li>
                  <li>
                    Cancel or reschedule early if your plans change, so the slot
                    can be used by others.
                  </li>
                  <li>
                    Repeated missed viewings may limit your ability to book
                    more.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: "payments",
            title: "Reservations and payments",
            content: (
              <>
                <p>
                  When you reserve a rental, we hold the property for you for a
                  short time while you pay. Payments are processed by our
                  payment provider, and amounts are shown in naira.
                </p>
                <ul>
                  <li>
                    <strong>Pay only through Veridom.</strong> Never send money
                    outside the platform, even if someone asks you to.
                  </li>
                  <li>
                    Your payment is held and released to the lister after
                    move-in is confirmed, or automatically after the period
                    shown on your deal.
                  </li>
                  <li>
                    On move-in day your lister shows you a 6-digit code. Enter
                    it only after you have the keys and have seen the property.
                    Veridom never asks for this code.
                  </li>
                </ul>
                <p>
                  After handover you have a limited time to report a problem. If
                  you report one, the payout is paused while our team reviews it
                  and decides whether to release the money or refund you.
                </p>
              </>
            ),
          },
          {
            id: "refunds",
            title: "Cancellations and refunds",
            content: (
              <>
                <p>
                  You can cancel a reservation before you pay, which frees the
                  property. If you cancel within the window shown on your deal
                  and before handover, you are entitled to a full refund.
                </p>
                <p>
                  If a reservation hold ends before payment, the property is
                  released. A payment that arrives late is honoured if the
                  property is still free and refunded otherwise.
                </p>
                <p>
                  Refunds go back to the original payment method where possible.
                  If that fails we will ask you for bank details on your
                  profile, and never by email or phone.
                </p>
              </>
            ),
          },
          {
            id: "listers",
            title: "Listers and teams",
            content: (
              <>
                <p>
                  A lister is an owner, agent or company that publishes
                  listings. The person who creates a lister is its owner and may
                  invite teammates and give them roles. Each person can only do
                  what their role allows.
                </p>
                <ul>
                  <li>
                    Owners are responsible for the actions of the people they
                    invite.
                  </li>
                  <li>
                    Payouts go to the verified bank account saved for the
                    lister, after any waiting period for new accounts.
                  </li>
                  <li>
                    Ownership documents are kept private and are only opened by
                    the Veridom team.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: "use",
            title: "Acceptable use",
            content: (
              <>
                <p>You agree not to:</p>
                <ul>
                  <li>Post false, misleading or duplicate listings.</li>
                  <li>
                    Take payments or arrange deals outside Veridom to avoid our
                    process.
                  </li>
                  <li>
                    Harass others, or use the platform for anything unlawful.
                  </li>
                  <li>
                    Try to break, scrape or interfere with the platform or its
                    security.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: "content",
            title: "Content and ownership",
            content: (
              <>
                <p>
                  You keep ownership of the photos, text and documents you
                  upload. You give Veridom permission to store, process and
                  display them on the platform so we can provide the service.
                </p>
                <p>
                  The Veridom name, logo, design and software belong to us and
                  may not be copied or reused without our permission.
                </p>
              </>
            ),
          },
          {
            id: "liability",
            title: "Our responsibility",
            content: (
              <>
                <p>
                  We work hard to keep Veridom accurate and available, but we
                  provide the platform as it is and cannot promise it will
                  always be uninterrupted or error free.
                </p>
                <p>
                  To the extent the law allows, Veridom is not liable for losses
                  that arise from agreements between customers and listers, or
                  for indirect or unforeseeable loss. Nothing in these terms
                  limits rights you have under Nigerian consumer protection law.
                </p>
              </>
            ),
          },
          {
            id: "ending",
            title: "Ending your use",
            content: (
              <p>
                You can stop using Veridom at any time. We may suspend or close
                an account that breaks these terms. Deals already paid for
                continue under the rules in these terms until they are complete.
              </p>
            ),
          },
          {
            id: "law",
            title: "Governing law and changes",
            content: (
              <>
                <p>
                  These terms are governed by the laws of the Federal Republic
                  of Nigeria, and disputes will be handled by the courts of
                  Nigeria unless the law says otherwise.
                </p>
                <p>
                  We may update these terms. When we make an important change we
                  will tell you on the platform or by email. Using Veridom after
                  a change means you accept the updated terms.
                </p>
              </>
            ),
          },
          {
            id: "contact",
            title: "Contact us",
            content: (
              <p>
                Questions about these terms? Write to{" "}
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
