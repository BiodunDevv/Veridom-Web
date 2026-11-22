import { Badge } from "@/components/ui/badge"

const tone = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (["PAID", "COMPLETED", "CONFIRMED", "REFUNDED"].includes(status))
    return "default"
  if (
    [
      "DISPUTED",
      "CANCELLED",
      "EXPIRED",
      "REFUND_DUE",
      "DECLINED",
      "NO_SHOW",
    ].includes(status)
  )
    return "destructive"
  if (["HELD", "REQUESTED", "PROPOSED"].includes(status)) return "secondary"
  return "outline"
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={tone(status)}>
      {status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase())}
    </Badge>
  )
}
