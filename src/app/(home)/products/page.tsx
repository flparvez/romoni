import Footer from "@/components/Footer";
import AllProducts from "@/components/products/AllProducts";
import ProductListSkeleton from "@/components/Skelton";
import { SITE_URL } from "@/hooks/serverApi";
import { Suspense } from "react";

// ✅ Generate Metadata (Recommended in App Router)
export async function generateMetadata() {
  return {
    title: "All Products - A1 Romoni",
    description:
      "Browse our premium collection of products at A1 Romoni. Best prices, top quality, fast delivery.",
  };
}

// ✅ Fetch Categories (Server-Side)
async function getCategories() {
  try {
    const res = await fetch(`${SITE_URL}/api/categories`);

    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.log("Category fetch failed → using fallback []");
    return [];
  }
}

// ✅ Page Component (Server Component)
export default async function Page() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-gray-50">
      
    <Suspense fallback={<ProductListSkeleton />}>
        <AllProducts categories={categories} />
      </Suspense>
      <Footer />
    </main>
  );
}
