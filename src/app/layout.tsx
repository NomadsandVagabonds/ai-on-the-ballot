import type { Metadata } from "next";
import { Inter, Lora, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeedbackNotice } from "@/components/layout/FeedbackNotice";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteDescription =
  "A nonpartisan transparency resource documenting the public AI governance positions of U.S. congressional candidates.";

export const metadata: Metadata = {
  title: {
    default: "AI on the Ballot",
    template: "%s | AI on the Ballot",
  },
  description: siteDescription,
  keywords: [
    "AI policy",
    "congressional candidates",
    "AI governance",
    "voter guide",
    "election 2026",
  ],
  openGraph: {
    title: "AI on the Ballot",
    description: siteDescription,
    type: "website",
    locale: "en_US",
    siteName: "AI on the Ballot",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI on the Ballot",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-body">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <FeedbackNotice />
      </body>
    </html>
  );
}
