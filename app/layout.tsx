import type { Metadata, Viewport } from "next"
import { Geist_Mono, Urbanist } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProviders } from "@/components/app/app-providers"
import { cn } from "@/lib/utils";

const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: { default: "Veridom | Verified homes, trusted deals", template: "%s" },
  description:
    "Browse verified properties across Nigeria, book viewings and close deals securely with Veridom.",
  applicationName: "Veridom",
  openGraph: {
    siteName: "Veridom",
    title: "Veridom | Verified homes, trusted deals",
    description:
      "Browse verified properties across Nigeria, book viewings and close deals securely.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", urbanist.variable)}
    >
      <body>
        <ThemeProvider>
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
