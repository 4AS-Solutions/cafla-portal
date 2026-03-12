import type { Metadata } from "next";
import { Inter, Space_Grotesk,  } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/providers/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})


export const metadata: Metadata = {
  title: "CAFLA Portal",
  description: "Colegio de Árbitros de Fútbol de Los Ángeles",
  manifest: "/manifest.json"
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
      <Toaster richColors position="top-right" />
        <AuthProvider>
          {children}
        </AuthProvider>

      </body>
    </html>
  )
}
