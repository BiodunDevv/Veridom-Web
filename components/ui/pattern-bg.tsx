import { cn } from "@/lib/utils"

/**
 * The Figma contour-line pattern, used as a quiet texture.
 *
 * Drawn as a CSS mask over the `--pattern-line` colour (deep green in light
 * mode, soft bright green in dark), so it reads on any card in either theme.
 * The SVG keeps its strokes at a crisp ~1px whatever size the card is.
 *
 * `className` goes on the outer layer: callers' opacity, blend and their own
 * fade (`[mask-image:...]`) still apply, on top of the line mask inside.
 * `object-right` keeps meaning "anchor the pattern to the right".
 */
const CORNER_FADE =
  "radial-gradient(130% 140% at 100% 0%, black 0%, rgb(0 0 0 / 0.55) 35%, transparent 70%)"

export function PatternBg({ className }: { className?: string }) {
  const right = className?.split(/\s+/).includes("object-right")
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-30 dark:opacity-60",
        className?.replace(/\bobject-right\b/, "")
      )}
    >
      <span
        className="absolute inset-0 bg-[var(--pattern-line)]"
        style={{
          // The lines, faded out from the top-right corner so they never
          // sit behind a card's text: decoration in the corner, calm body.
          maskImage: `url(/landing/pattern-lines.svg), ${CORNER_FADE}`,
          WebkitMaskImage: `url(/landing/pattern-lines.svg), ${CORNER_FADE}`,
          maskSize: "cover, 100% 100%",
          WebkitMaskSize: "cover, 100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: right ? "right center, 0 0" : "center, 0 0",
          WebkitMaskPosition: right ? "right center, 0 0" : "center, 0 0",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  )
}
