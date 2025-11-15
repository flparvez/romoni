import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Footer from "@/components/Footer";
import ProductDetailPage from "@/components/products/ProductDetailPage";
import { SITE_URL } from "@/hooks/serverApi";
import { IProduct, IProductImage } from "@/types";

type Props = { params: { slug: string } };

export const dynamicParams = true;

/* ----------------------------------------------------------
 ⚡ generateStaticParams → FAST & LIGHT
 Only fetch slugs (not full products) to avoid 2MB cache limits
----------------------------------------------------------- */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${SITE_URL}/api/products?fields=slug`, {
      cache: "force-cache",
    });

    const json = await res.json();
    if (!json?.products) return [];

    return json.products.slice(0, 100).map((p: { slug: string }) => ({
      slug: p.slug,
    }));

  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/* ----------------------------------------------------------
 ⚡ Fetch product with always-fresh data
----------------------------------------------------------- */
async function getProduct(slug: string): Promise<IProduct | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/products/slug/${slug}`, {
      cache: "force-cache",            // 👈 always fresh product data
      next: { revalidate: 60 },     // 👈 revalidate per minute for speed
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.product || null;
  } catch (e) {
    console.error("getProduct error:", e);
    return null;
  }
}

/* ----------------------------------------------------------
 ⚡ SEO Metadata — Fully Optimized
----------------------------------------------------------- */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product is unavailable.",
      robots: { index: false, follow: false },
    };
  }

  const images = product.images?.map((i) => i.url) || [];
  const description = (product.seoDescription || product.name).slice(0, 160);

  return {
    title: `${product.name} Price in Bangladesh`,
    description,
    alternates: {
      canonical: `https://a1romoni.xyz/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      url: `https://a1romoni.xyz/product/${product.slug}`,
      images,
      siteName: "A1 Romoni",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: images[0],
    },
  };
};

/* ----------------------------------------------------------
 ⚡ PAGE — Always Fresh, Super Fast
----------------------------------------------------------- */
export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;

  // Always fresh product
  const product = await getProduct(slug);
  if (!product) notFound();

  // JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.map((i) => i.url),
    description: (product.seoDescription || product.name).slice(0, 160),
    sku: product._id,
    brand: { "@type": "Brand", name: "A1 Romoni" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      url: `https://a1romoni.xyz/product/${product.slug}`,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto px-0 sm:px-6 lg:px-8 py-1">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="py-1 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600 hover:underline">
                Home
              </Link>
            </li>

            {product.category?.slug && (
              <>
                <li>/</li>
                <li>
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}

            <li>/</li>
            <li className="font-semibold text-gray-700 max-w-[180px] truncate">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details Component */}
        <ProductDetailPage product={product} />
      </div>

      <Footer />
    </main>
  );
}
