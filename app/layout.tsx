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
