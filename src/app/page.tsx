// app/page.tsx (Server Component)


import CategorySlider from "@/components/Header/CategorySlider";
import ProductList from "@/components/products/ProductList";
import { SITE_URL } from "@/types/product";
import ProductFilter from "@/components/filter/Fiter";
import HeroSection from "@/components/home/HeaderSection";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { ProductSkeleton } from "@/components/skeletons";

export const revalidate = 60; // ISR: প্রতি 60s পরে data re-generate হবে

export default async function Homepage() {
  // ✅ Server fetch (ISR enabled)
  const productRes = await fetch(`${SITE_URL}/api/products`, {
    next: { revalidate: 60 },
  });
  const categoryRes = await fetch(`${SITE_URL}/api/categories`, {
    next: { revalidate: 120 },
  });

  const { products } = await productRes.json();
  const { categories } = await categoryRes.json();

  return (
    <div>
      <HeroSection Allproducts={products} />
      <h2 className="text-2xl font-bold mt-4 text-center from-teal-600 to-cyan-600">Top Categories</h2>
      <CategorySlider categories={categories} />

      <Suspense fallback={<ProductSkeleton />}>
     
        <ProductList />
      </Suspense>
      <ProductFilter categories={categories} />

                  <Footer />
    </div>
  );
}
