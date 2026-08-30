import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { WhatsAppDemoProvider } from "@/components/ui/WhatsAppDemoDialog";
import { siteConfig } from "@/config/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Aurevia Jewels | Elegant Jewelry & Ornaments",
    template: "%s",
  },
  description:
    "Discover elegant necklaces, earrings, rings, bangles, bridal sets and jewelry collections from Aurevia Jewels. Browse online and order directly through WhatsApp.",
  keywords: [
    "jewelry",
    "ornaments",
    "necklaces",
    "earrings",
    "rings",
    "bangles",
    "bridal jewelry",
    "gold jewelry",
    "pearl jewelry",
    "WhatsApp order",
    "Bangladesh jewelry",
    "Aurevia Jewels",
  ],
  authors: [{ name: "Aurevia Jewels" }],
  creator: "Aurevia Jewels",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Aurevia Jewels | Elegant Jewelry & Ornaments",
    description:
      "Discover elegant necklaces, earrings, rings, bangles, bridal sets and jewelry collections from Aurevia Jewels. Browse online and order directly through WhatsApp.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aurevia Jewels - Timeless Elegance, Made to Shine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurevia Jewels | Elegant Jewelry & Ornaments",
    description:
      "Discover elegant necklaces, earrings, rings, bangles, bridal sets and jewelry collections. Order directly through WhatsApp.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-ivory text-charcoal antialiased">
        <WhatsAppDemoProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsApp />
        </WhatsAppDemoProvider>
      </body>
    </html>
  );
}
