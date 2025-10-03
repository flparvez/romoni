import Providers from "@/components/Providers";
import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import React from "react";

// --- Placeholder Components ---
// These are added to resolve the import errors. Replace them with your actual components.

const Navbar = () => (
  <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex-shrink-0">
          <a href="/" className="text-xl font-bold">A1 Romoni</a>
        </div>
        <nav className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-4">
            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Shop</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">About</a>
          </div>
        </nav>
      </div>
    </div>
  </header>
);

const BottomBar = () => (
  <footer className="bg-gray-100 border-t">
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} A1 Ladies Collection - Romoni. All rights reserved.</p>
    </div>
  </footer>
);


const ImageKitProvider = ({ children }: { children: React.ReactNode, urlEndpoint: string }) => <>{children}</>;
const Toaster = () => <div id="sonner-toaster" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }} />;

// --- End of Placeholders ---


// ✅ Business Info
const shopName = "A1 Ladies Collection - Romoni";
const shopEmail = "support@romoni.store";
const shopPhone = "+8801608257876";
const baseUrl = "https://a1romoni.vercel.app/";

// ✅ Metadata (SEO Optimized)
export const metadata: Metadata = {
  title: {
    default: "A1 Ladies Collection | A1 Romoni",
    template: "%s | A1 Romoni",
  },
  description:
    "Buy Authentic A1 Ladies Collection in Bangladesh. Fashion Ladies Collection And  Fast Delivery.",
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
      "Buy Authentic A1 Ladies Collection in Bangladesh. Fashion Ladies Collection And  Fast Delivery.",
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

// ✅ JSON-LD Schema for SEO
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
  sameAs: [
    "https://www.facebook.com/a1ladiesfr",
  ],
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ik.imagekit.io" />

        {/* Preload Hero Image */}
        <link rel="preload" as="image" href="/hero-image.webp" type="image/webp" />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBusiness) }}
        />
        
        {/* ✅ Basic Global Styles to replace globals.css */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            color: #111827;
          }
        `}} />

         <meta name="google-site-verification" content="5OMe3R7qnnZDzzl1tmgyBi4B15zyX0fzh-dLDUPfAA0" />
      </head>

      <body>
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

