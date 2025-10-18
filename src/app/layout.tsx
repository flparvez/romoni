// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { ImageKitProvider } from "@imagekit/next";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import "./globals.css"; // ✅ Tailwind styles লোড করবে
import Navbar from "@/components/Header/Navbar";
import BottomBar from "@/components/Header/Bottom";

// ✅ Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ✅ Business Info
const shopName = "A1 Ladies Collection - Romoni";
const shopEmail = "support@romoni.store";
const shopPhone = "+8801608257876";
const baseUrl = "https://a1romoni.vercel.app";

// ✅ Metadata (SEO Optimized)
export const metadata: Metadata = {
  title: {
    default: "A1 Ladies Collection | A1 Romoni",
    template: "%s | A1 Romoni",
  },
  description:
    "Buy Authentic A1 Ladies Collection in Bangladesh. Fashion Ladies Collection And Fast Delivery.",
  keywords: [
    "A1 Ladies Collection",
    "Romoni",
    "Ladies Collection",
    "Romoni Ladies Collection",
  ],
  authors: [{ name: shopName, url: baseUrl }],
  creator: shopName,
  publisher: shopName,
  metadataBase: new URL(baseUrl),

  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: baseUrl,
    siteName: shopName,
    title: "A1 Ladies Collection - Romoni",
    description:
      "Buy Authentic A1 Ladies Collection in Bangladesh. Fashion Ladies Collection And Fast Delivery.",
    images: [
      {
        url: `/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "A1 Ladies Collection - Romoni",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    creator: "@UniqueStoreBD",
    title: "A1 Ladies Collection - Romoni",
    description:
      "Shop authentic products in Bangladesh – Smart Watches, TWS earbuds, home appliances, gadgets & more.",
    images: [`/og-image.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  manifest: `${baseUrl}/manifest.json`,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  alternates: {
    canonical: baseUrl,
    languages: {
      "bn-BD": `${baseUrl}/bn`,
      "en-US": `${baseUrl}/en`,
    },
  },

  category: "ecommerce",
};

// ✅ Viewport (Responsive + Theme Color)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

// ✅ JSON-LD Schema
const jsonLdBusiness = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${baseUrl}#store`,
  name: shopName,
  description:
    "A1 Romoni offers a wide range of ladies fashion collection at an affordable price.",
  url: baseUrl,
  telephone: shopPhone,
  email: shopEmail,
  address: {
    "@type": "PostalAddress",
    streetAddress: "8R8Q+W6C Karnaphuli",
    addressLocality: "Karnaphuli",
    addressRegion: "Chattagram",
    postalCode: "1219",
    addressCountry: "BD",
  },
  geo: { "@type": "GeoCoordinates", latitude: "23.7629", longitude: "90.4256" },
  openingHours: ["Mo-Su 09:00-20:00", "Fr 13:30-20:00"],
  priceRange: "$$",
  paymentAccepted: "Cash, bKash, Nagad, Card",
  currenciesAccepted: "BDT",
  hasMap: "https://maps.google.com/?q=23.7629,90.4256",
  sameAs: ["https://www.facebook.com/a1ladiesfr"],
};

// ✅ Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://ik.imagekit.io" />

        {/* Preload Hero Image */}
        <link
          rel="preload"
          as="image"
          href="/hero-image.webp"
          type="image/webp"
        />

 {/* ✅ Google Site Verification */}
        <meta
          name="google-site-verification"
          content="5OMe3R7qnnZDzzl1tmgyBi4B15zyX0fzh-dLDUPfAA0"
        />
     
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBusiness) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <Providers>
          <ImageKitProvider urlEndpoint={urlEndpoint}>
            <Navbar />
            <main>{children}</main>
            <BottomBar />
          </ImageKitProvider>
          <Toaster />
        </Providers>

        {/* GTM */}
        <GoogleTagManager gtmId="GTM-5ZLXGQZG" />
      </body>
    </html>
  );
}
