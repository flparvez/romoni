// app/page.tsx (Server Component)


import CategorySlider from "@/components/Header/CategorySlider";
import ProductList from "@/components/products/ProductList";

import ProductFilter from "@/components/filter/Fiter";
import HeroSection from "@/components/home/HeaderSection";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import ProductListSkeleton from "@/components/Skelton";
import { SITE_URL } from "@/hooks/serverApi";


export default async function Homepage() {
  // ✅ Server fetch 
  const productRes = await fetch(`${SITE_URL}/api/products?&limit=18` ,{
    cache: 'no-store', next: { revalidate: 600 }
  });
  const categoryRes = await fetch(`${SITE_URL}/api/categories`,
    {
      cache: 'force-cache',
    }
  );

  const { products } = await productRes.json();
  const { categories } = await categoryRes.json();

  return (
    <div>
<Suspense fallback={<ProductListSkeleton />}>
      <HeroSection Allproducts={products} />
      </Suspense>
      <h2 className="text-2xl font-bold mt-2 text-center from-teal-600 to-cyan-600">Top Categories</h2>
      <CategorySlider categories={categories} />

     <Suspense fallback={<ProductListSkeleton />}>
      <ProductList products={products} />

     </Suspense>

     
{/* Latest Product */}

 <h2 className="text-2xl font-bold mt-2 text-center from-teal-600 to-cyan-600">Latest Product</h2>
      <ProductFilter categories={categories} />

                  <Footer />
    </div>
  );
}
