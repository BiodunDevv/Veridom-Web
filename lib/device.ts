/** Turns a raw user agent into "Chrome on macOS". */
export function describeDevice(userAgent?: string | null) {
  if (!userAgent) return { label: "Browser session", mobile: false }

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Browser"

  const os = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : ""

  return {
    label: os ? `${browser} on ${os}` : browser,
    mobile: /iPhone|Android|Mobile/.test(userAgent),
  }
}
