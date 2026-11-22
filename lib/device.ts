export type DeviceInfo = {
  /** "Chrome on Mac", "Safari on iPhone". */
  label: string
  browser: string
  /** "Chrome 157 · macOS 15". */
  detail: string
  type: "phone" | "tablet" | "computer"
  mobile: boolean
}

const version = (ua: string, re: RegExp) => ua.match(re)?.[1]?.split(".")[0]

/**
 * Names a device from its user agent. The API stores the raw string, which is
 * unreadable ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."), so this
 * turns it into a browser, a device and an operating system.
 */
export function describeDevice(
  ...sources: (string | null | undefined)[]
): DeviceInfo {
  // The name and the user agent can both be the raw string; take any that has content.
  const ua = sources.find(
    (s) => s && /Mozilla\/|AppleWebKit|Gecko|Mobile/.test(s)
  )
  const plain = sources.find((s) => s && s !== ua)
  if (!ua) {
    return {
      label: plain || "Browser session",
      browser: plain || "Browser",
      detail: "",
      type: "computer",
      mobile: false,
    }
  }

  const edge = /Edg(?:e|A|iOS)?\//.test(ua)
  const opera = /OPR\/|Opera/.test(ua)
  const samsung = /SamsungBrowser\//.test(ua)
  const firefox = /Firefox\/|FxiOS\//.test(ua)
  const chrome = /Chrome\/|CriOS\//.test(ua) && !edge && !opera && !samsung
  const safari =
    /Safari\//.test(ua) && !chrome && !edge && !opera && !samsung && !firefox

  const browser = edge
    ? "Edge"
    : opera
      ? "Opera"
      : samsung
        ? "Samsung Internet"
        : firefox
          ? "Firefox"
          : chrome
            ? "Chrome"
            : safari
              ? "Safari"
              : "Browser"
  const browserVersion = edge
    ? version(ua, /Edg(?:e|A|iOS)?\/([\d.]+)/)
    : opera
      ? version(ua, /OPR\/([\d.]+)/)
      : samsung
        ? version(ua, /SamsungBrowser\/([\d.]+)/)
        : firefox
          ? version(ua, /(?:Firefox|FxiOS)\/([\d.]+)/)
          : chrome
            ? version(ua, /(?:Chrome|CriOS)\/([\d.]+)/)
            : safari
              ? version(ua, /Version\/([\d.]+)/)
              : undefined

  const iPhone = /iPhone|iPod/.test(ua)
  const iPad = /iPad/.test(ua)
  const android = /Android/.test(ua)
  const windows = /Windows/.test(ua)
  const mac = /Macintosh|Mac OS X/.test(ua) && !iPhone && !iPad
  const chromeOs = /CrOS/.test(ua)
  const linux = /Linux|X11/.test(ua) && !android && !chromeOs

  const tablet = iPad || (android && !/Mobile/.test(ua))
  const phone = iPhone || (android && /Mobile/.test(ua))
  const device = iPhone
    ? "iPhone"
    : iPad
      ? "iPad"
      : android
        ? tablet
          ? "Android tablet"
          : "Android phone"
        : mac
          ? "Mac"
          : windows
            ? "Windows PC"
            : chromeOs
              ? "Chromebook"
              : linux
                ? "Linux PC"
                : ""
  const os =
    iPhone || iPad
      ? `iOS ${version(ua, /OS (\d+)[_\d]*/) ?? ""}`.trim()
      : android
        ? `Android ${version(ua, /Android ([\d.]+)/) ?? ""}`.trim()
        : mac
          ? "macOS"
          : windows
            ? `Windows ${/Windows NT 10/.test(ua) ? "10/11" : ""}`.trim()
            : chromeOs
              ? "ChromeOS"
              : linux
                ? "Linux"
                : ""

  return {
    label: device ? `${browser} on ${device}` : browser,
    browser,
    detail: [browserVersion ? `${browser} ${browserVersion}` : browser, os]
      .filter(Boolean)
      .join(" · "),
    type: tablet ? "tablet" : phone ? "phone" : "computer",
    mobile: phone || tablet,
  }
}
