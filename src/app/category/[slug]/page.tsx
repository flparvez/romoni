import React from "react";
import NewArrived from "@/components/home/NewArrived";
import CategorySlider from "@/components/Header/CategorySlider";

import type { IIProduct } from "@/types/iproduct";
import { SITE_URL } from "@/types/product";
import Footer from "@/components/Footer";

interface Props {
  params: { slug: string };
}

// ✅ Generate all category slugs for SSG
export async function generateStaticParams() {
  try {
    const res = await fetch(`${SITE_URL}/api/categories`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch categories");
      return [];
    }

    const data = await res.json();
    const categories = Array.isArray(data?.categories) ? data.categories : [];

    return categories.map((cat: { slug: string }) => ({
      slug: cat.slug,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}


// ✅ ISR: Page will be cached & revalidated every 60s
export const revalidate = 60;

const ProductByCategory = async ({ params }: Props) => {
  const { slug } = params;

  // Fetch all products with ISR
  const productRes = await fetch(`${SITE_URL}/api/products`, {
    next: { revalidate: 60 }, // ISR: Revalidate every 60s
  });
    const res = await fetch(`${SITE_URL}/api/categories`, {
      next: { revalidate: 60 }, // ISR support for categories too
    });
    const { categories } = await res.json();

  if (!productRes.ok) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load products.</p>
      </div>
    );
  }

  const { products } = await productRes.json();

  // ✅ Filter products by category slug
  const filteredProducts = products.filter(
    (product: IIProduct) => product.category?.slug === slug
  );

  // ✅ Format category title
const categoryTitle = slug ? slug.replace(/-/g, " ").toUpperCase() : "CATEGORY";

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-6 px-4 md:px-8 lg:px-12">
        {/* Intro */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {categoryTitle} - A1 Romoni
          </h1>
          <p className="mt-2 text-gray-600">
            Explore our collection of {categoryTitle} products.
          </p>
        </div>

        {/* Category slider */}
     <CategorySlider categories={categories} />


        {/* Products grid or fallback */}
        {filteredProducts.length > 0 ? (
          <NewArrived products={filteredProducts} />
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl font-semibold mb-2">
              No products found for this category.
            </p>
            <p className="text-gray-400">
              Please check back later or explore other categories.
            </p>
          </div>
        )}
      </main>
                  <Footer />
    </div>
  );
};

export default ProductByCategory;
