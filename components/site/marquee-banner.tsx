import {
  BadgeCheck,
  CalendarCheck,
  Handshake,
  KeyRound,
  ShieldCheck,
  Wallet,
} from "lucide-react"

const items = [
  { icon: BadgeCheck, text: "Every listing verified by our team" },
  { icon: CalendarCheck, text: "Book viewings in a few taps" },
  { icon: ShieldCheck, text: "Secure, tracked payments" },
  { icon: Handshake, text: "Trusted agents and owners" },
  { icon: Wallet, text: "Transparent payouts" },
  { icon: KeyRound, text: "From search to keys, end to end" },
]

/** Infinite scrolling trust strip; pauses on hover. */
export function MarqueeBanner() {
  const track = [...items, ...items]

  return (
    <div
      className="group relative overflow-hidden bg-primary text-primary-foreground"
      role="region"
      aria-label="Why Veridom"
    >
      <ul className="flex w-max animate-marquee items-center py-2 text-xs font-medium group-hover:[animation-play-state:paused] sm:text-[13px]">
        {track.map(({ icon: Icon, text }, i) => (
          <li
            key={i}
            aria-hidden={i >= items.length}
            className="flex shrink-0 items-center gap-2 px-6 sm:px-8"
          >
            <Icon className="size-3.5 opacity-90" />
            <span className="whitespace-nowrap">{text}</span>
            <span
              aria-hidden
              className="ml-6 size-1 rounded-full bg-primary-foreground/40 sm:ml-8"
            />
          </li>
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-primary to-transparent" />
    </div>
  )
}
