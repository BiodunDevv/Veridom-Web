import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Shown when a query failed; the reason is already in a toast. */
export function RetryState({
  label = "this",
  onRetry,
}: {
  label?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/60 px-6 py-10 text-center">
      <p className="text-sm font-medium">We couldn&apos;t load {label}.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw /> Try again
      </Button>
    </div>
  )
}
