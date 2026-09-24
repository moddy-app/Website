import { Google_Sans, Google_Sans_Code } from "next/font/google"

// Self-hosted at build time by next/font: no request to Google at runtime.
// next/font has no metrics for these families, so the fallback is declared
// explicitly instead of being generated.
export const fontSans = Google_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-google-sans",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
})

export const fontMono = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-google-sans-code",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "monospace"],
})
