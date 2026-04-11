import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Logo } from "@/components/logo"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
const backendConnected = Boolean(backendUrl)

export default function Page() {
  return (
    <main className="min-h-svh bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-5xl items-center">
        <Card className="w-full shadow-[0_18px_50px_-34px_rgba(15,23,42,0.35)]">
          <CardHeader className="gap-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo className="size-10" />
                <div>
                  <CardTitle className="text-xl">Veridom</CardTitle>
                  <CardDescription>
                    Tenant and landlord experience placeholder
                  </CardDescription>
                </div>
              </div>
              <Badge variant={backendConnected ? "default" : "outline"}>
                {backendConnected ? "Backend connected" : "Backend not configured"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Property access, onboarding, and account journeys start here.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                This app is reserved for the tenant and landlord experience. Login
                and registration flows are available now as frontend-complete
                placeholders, ready for backend integration later.
              </p>
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Backend URL:</span>{" "}
                {backendUrl ?? "Not configured"}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="h-12 rounded-lg px-6 font-semibold">
                <Link href="/register">Create account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-6 font-semibold">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
