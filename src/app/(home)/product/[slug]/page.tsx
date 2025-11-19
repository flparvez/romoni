
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Footer from "@/components/Footer";
import ProductDetailPage from "@/components/products/ProductDetailPage";
import { SITE_URL } from "@/hooks/serverApi";
import { IProduct } from "@/types";

// ⚡ Update for Next.js 15/16: Params must be a Promise
type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

/* ----------------------------------------------------------
 ⚡ GENERATE STATIC PARAMS (Optimized)
----------------------------------------------------------- */
export async function generateStaticParams() {
  try {
    // Fetch only slugs using the optimized API
    const res = await fetch(`${SITE_URL}/api/products?fields=slug&limit=60`, {
      next: { revalidate: 3600 }, // Revalidate list every hour
    });

    const json = await res.json();
    if (!json?.products) return [];

    return json.products.map((p: { slug: string }) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/* ----------------------------------------------------------
 ⚡ FETCH PRODUCT (Centralized Logic)
----------------------------------------------------------- */
async function getProduct(slug: string): Promise<IProduct | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/products/slug/${slug}`, {
      // 'force-cache' and 'revalidate' can conflict.
      // Using revalidate implies ISR (Incremental Static Regeneration).
      next: { revalidate: 60 }, 
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
 ⚡ SEO METADATA
----------------------------------------------------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ⚡ Await params first
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | A1 Romoni",
      description: "This product is currently unavailable.",
      robots: { index: false, follow: false },
    };
  }

  const images = product.images?.map((i) => i.url) || [];
  const description = (product.seoDescription || product.name).slice(0, 160);
  const productUrl = `https://uniquestorebd.store/product/${product.slug}`;

  return {
    title: `${product.name} Price in Bangladesh`,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.name,
      description,
      url: productUrl,
      images,
      siteName: "A1 Romoni",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: images[0],
    },
  };
}

/* ----------------------------------------------------------
 ⚡ MAIN PAGE COMPONENT
----------------------------------------------------------- */
export default async function ProductDetailsPage({ params }: Props) {
  // ⚡ Await params first (Critical for Next.js 15+)
  const { slug } = await params;

  const product = await getProduct(slug);
  if (!product) notFound();

  // JSON-LD Schema for Google Rich Snippets
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
      url: `https://uniquestorebd.store/product/${product.slug}`,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main>
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto px-0 sm:px-6 lg:px-8 py-1">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="py-1 text-sm mb-4">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600 hover:underline transition-colors">
                Home
              </Link>
            </li>

            {product.category?.slug && (
              <>
                <li>/</li>
                <li>
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="hover:text-blue-600 hover:underline transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}

            <li>/</li>
            <li className="font-semibold text-gray-700 max-w-[200px] truncate">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details Section */}
        <ProductDetailPage product={product} />
      </div>

      <Footer />
    </main>
  );
}