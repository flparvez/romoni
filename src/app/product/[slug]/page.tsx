import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IIProduct, IProductImage } from "@/types/iproduct";
import { SITE_URL } from "@/types/product";
import Footer from "@/components/Footer";
import ProductDetailPage from "@/components/products/ProductDetailPage";

export const revalidate = 60;
export const dynamicParams = false;

type Props = { params: { slug: string } };

const fetchWithCache = async (url: string) => {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ["products"] },
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

export async function generateStaticParams() {
  const data = await fetchWithCache(`${SITE_URL}/api/products`);
  if (!data?.products) return [];
  return data.products.slice(0, 100).map((p: IIProduct) => ({ slug: p.slug }));
}

const getProduct = async (slug: string): Promise<IIProduct | null> => {
  const data = await fetchWithCache(`${SITE_URL}/api/products/slug/${slug}`);
  return data?.product || null;
};

const getAllProducts = async (): Promise<IIProduct[]> => {
  const data = await fetchWithCache(`${SITE_URL}/api/products`);
  return data?.products || [];
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const images = product.images?.map((img: IProductImage) => img.url) || [];
  const description = (product.seoDescription || product.name).slice(0, 160);
  const productUrl = `https://a1romoni.vercel.app/product/${product.slug}`;

  return {
    title: `${product.shortName || product.name} Price in Bangladesh - ${product.name}`,
    description,
    keywords: product.seoKeywords?.join(", "),
    alternates: { canonical: productUrl },
    openGraph: {
      title: product.name,
      description,
      url: productUrl,
      siteName: "A1 Romoni",
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: images[0],
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
  };
};

const ProductDetailsPage = async ({ params }: Props) => {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getProduct(slug),
    getAllProducts(),
  ]);

  if (!product) notFound();

  const productUrl = `https://a1romoni.vercel.app/product/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images?.map((img: IProductImage) => img.url) || [],
    description: product.description?.slice(0, 5000),
    sku: product._id,
    brand: { "@type": "Brand", name: "A1 Romoni" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BDT",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "A1 Romoni" },
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto px-0 sm:px-6 lg:px-8 py-0">
        <nav aria-label="Breadcrumb" className="py-1 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link
                href="/"
                className="hover:text-blue-600 hover:underline transition-colors"
              >
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
            <li
              className="font-semibold text-gray-700 truncate max-w-[200px]"
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </nav>
        <ProductDetailPage products={products} product={product} />
      </div>
      <Footer />
    </main>
  );
};

export default ProductDetailsPage;
