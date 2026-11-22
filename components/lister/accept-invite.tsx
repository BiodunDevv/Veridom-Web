"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthModal } from "@/components/auth/auth-modal"
import { useMe } from "@/features/auth/hooks"
import { useAcceptInvite } from "@/features/lister/org-hooks"

/** Landing page for the link in an invitation email. */
export function AcceptInvite() {
  const router = useRouter()
  const token = useSearchParams().get("token") ?? ""
  const me = useMe()
  const accept = useAcceptInvite(() => router.push("/lister"))
  const auth = useAuthModal()

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Join a lister</h1>
      {!token ? (
        <p className="text-sm text-muted-foreground">
          This invitation link is missing its token. Open the link from your
          email again.
        </p>
      ) : me.isPending ? (
        <Loader2 className="mx-auto size-5 animate-spin" />
      ) : me.data ? (
        <>
          <p className="text-sm text-muted-foreground">
            You&apos;re signed in as {me.data.email}. The invitation must have
            been sent to this email, and it must be verified.
          </p>
          <Button
            size="lg"
            disabled={accept.isPending}
            onClick={() => accept.mutate(token)}
          >
            {accept.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}{" "}
            Accept invitation
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Sign in with the email the invitation was sent to, then come back to
            accept it.
          </p>
          <Button size="lg" onClick={() => auth.open("login")}>
            Sign in
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => auth.open("register")}
          >
            Create an account
          </Button>
        </>
      )}
    </section>
  )
}
