const EXACT = new Set([
  "gclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "gad_campaignid",
  "campaignid",
  "adgroupid",
  "kwd",
  "fbclid",
  "ttclid",
  "msclkid",
  "ref",
])

const STORAGE_KEY = "veridom-tracking"

/** Campaign and click-id params we keep on every URL. */
export const isTrackingParam = (key: string) =>
  key.startsWith("utm_") || EXACT.has(key)

export function readStored(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

export function writeStored(params: Record<string, string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {
    // storage unavailable
  }
}
