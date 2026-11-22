/** The newest success message from the API, shown under the next toast. */
let latest: { text: string; at: number } | null = null

export const rememberApiMessage = (text: unknown) => {
  if (typeof text === "string" && text.trim()) {
    latest = { text: text.trim(), at: Date.now() }
  }
}

/** Returns the message once, only if it is fresh. */
export const takeApiMessage = (title?: string) => {
  const found =
    latest && Date.now() - latest.at < 5000 ? latest.text : undefined
  latest = null
  return found && found.toLowerCase() !== title?.toLowerCase()
    ? found
    : undefined
}
