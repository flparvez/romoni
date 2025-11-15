import React from "react";
import NewArrived from "@/components/home/NewArrived";
import CategorySlider from "@/components/Header/CategorySlider";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/hooks/serverApi";
import { ICategory, IProduct } from "@/types";
import CategoryPagination from "@/components/CategoryPagination";

interface Props {
  params: { slug: string };
  searchParams?: { page?: string };
}

// ----------- Safe Fetch Helper -----------
async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      cache: "force-cache",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// ----------- Static Params For Build -----------
export async function generateStaticParams() {
  const data = await safeFetch<{ categories: { slug: string }[] }>(
    `${SITE_URL}/api/categories`
  );

  if (!data?.categories?.length) return [];

  return data.categories.map((cat) => ({ slug: cat.slug }));
}

// ----------- Metadata Per Category -----------
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const data = await safeFetch<{ categories: ICategory[] }>(
    `${SITE_URL}/api/categories`
  );

  const category = data?.categories?.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: "Category Not Found | A1 Romoni",
      description: "This category does not exist.",
    };
  }

  const name = category.name || slug.replace(/-/g, " ");

  return {
    title: `${name} Price in Bangladesh 2025 | A1 Romoni`,
    description: `Buy the best ${name} products online in Bangladesh from A1 Romoni.`,
    openGraph: {
      title: name,
      description: `Explore ${name} products at the best prices.`,
      images: [category.images?.[0]?.url || ""],
      url: `${SITE_URL}/category/${slug}`,
      type: "website",
    },
  };
}

// ----------- Main Category Page -----------
export default async function ProductByCategory({ params, searchParams }: Props) {
  const { slug } = await params;
  const currentPage = Number(searchParams?.page || 1);

  // Fetch category + paginated products
  const [categoryData, productData] = await Promise.all([
    safeFetch<{ categories: ICategory[] }>(`${SITE_URL}/api/categories`),
    safeFetch<{
      products: IProduct[];
      totalPages: number;
      currentPage: number;
    }>(
      `${SITE_URL}/api/products?category=${slug}&page=${currentPage}&limit=20`
    ),
  ]);

  const categories = categoryData?.categories || [];
  const products = productData?.products || [];
  const totalPages = productData?.totalPages || 1;

  const categoryTitle = slug.replace(/-/g, " ").toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-4 px-2 md:px-8 lg:px-12">

        {/* Title */}
        <div className="mb-5 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {categoryTitle} - A1 Romoni
          </h1>
          <p className="text-gray-600 mt-1">
            Explore our exclusive {categoryTitle} collection.
          </p>
        </div>

        {/* Category Slider */}
        <CategorySlider categories={categories} />

        {/* Product Grid */}
        {products.length > 0 ? (
          <>
            <NewArrived products={products} />

            {/* Pagination */}
            <div className="flex justify-center my-8">
              {totalPages > 1 && (
                <CategoryPagination
                  slug={slug}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl font-semibold">No products found.</p>
            <p className="text-gray-400">
              Try browsing other categories.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
