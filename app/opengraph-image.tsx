import { ImageResponse } from "next/og"

export const alt = "Veridom: verified homes, trusted deals"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** The default link preview card for every page without its own image. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "white",
        background:
          "linear-gradient(135deg, #0b2a1a 0%, #0f3d27 55%, #145a38 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="76" height="76" viewBox="0 0 92 92">
          <rect width="92" height="92" rx="22" fill="#0f2e1f" />
          <g transform="translate(46 46) scale(.82) translate(-45.5 -46)">
            <path
              d="M16.79 28.38c.18-3.27 2.98-5.77 6.25-5.59h.04c1.4.04 2.76.54 3.85 1.44 8.05 7.4 12.12 18.19 10.97 29.06 0 .5-.65.48-.81 0-2.18-7.4-9.37-15.9-15.74-18.44-2.84-.83-4.74-3.51-4.56-6.47Z"
              fill="#7be3a8"
            />
            <path
              d="M71.93 27.77c-.14-4.98-4.3-8.91-9.28-8.77-.14 0-.28.01-.41.02-10.92.24-25.62 28.36-17.21 53.9 0 .52.6.42.65-.1 1.17-17.78 11.83-31.63 21.42-37.09 3.13-1.42 5.05-4.63 4.83-8.06Z"
              fill="#34d27b"
            />
            <path
              d="M12.01 53.51c.2 3.09 2.85 5.45 5.95 5.3 6.76.24 13.28 2.6 18.62 6.75.38.32.44.2.2-.65-1.85-6.49-11.79-17.37-19.01-17.37-3.13-.06-5.71 2.42-5.78 5.55 0 .17 0 .33.01.5Z"
              fill="#22b862"
            />
            <path
              d="M78.99 53.51c-.2 3.09-2.85 5.45-5.95 5.3-6.76.24-13.28 2.6-18.62 6.75-.38.32-.44.2-.2-.65 1.85-6.49 11.79-17.37 19.01-17.37 3.13-.06 5.71 2.42 5.78 5.55 0 .17 0 .33-.01.5Z"
              fill="#a6f0c6"
            />
          </g>
        </svg>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          Veridom
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.03,
            letterSpacing: -3,
            maxWidth: 940,
          }}
        >
          Verified homes, trusted deals.
        </div>
        <div style={{ fontSize: 32, color: "#a6f0c6", maxWidth: 860 }}>
          Browse verified properties across Nigeria, book viewings and pay
          securely.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {["Verified listings", "Secure payments", "Trusted agents"].map(
          (label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 24,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              {label}
            </div>
          )
        )}
      </div>
    </div>,
    size
  )
}
