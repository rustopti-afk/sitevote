import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Inter with Latin + Cyrillic so Ukrainian text renders with the same font.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "SiteVote — Голосуй за найкращі сайти",
    template: "%s | SiteVote",
  },
  description:
    "Відкривай, оцінюй та підтримуй найцікавіші веб-проєкти спільноти. Твій голос формує рейтинг найкращих сайтів.",
  openGraph: {
    type: "website",
    siteName: "SiteVote",
    title: "SiteVote — Голосуй за найкращі сайти",
    description:
      "Відкривай, оцінюй та підтримуй найцікавіші веб-проєкти спільноти. Твій голос формує рейтинг найкращих сайтів.",
    locale: "uk_UA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${inter.className} bg-white text-gray-900 antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          {/* Offset for the fixed header (h-16). */}
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
