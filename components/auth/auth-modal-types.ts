export type AuthView = "login" | "register" | "verify"

/** Passed by the modal so forms stay on the page. */
export type EmbeddedAuth = {
  switchTo: (view: AuthView, email?: string) => void
  close: () => void
}
