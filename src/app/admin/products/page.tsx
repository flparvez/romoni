import ProductsClientPage from "@/components/admin/Product/ProductsClientPage";
import { SITE_URL } from "@/hooks/serverApi";
import { Suspense } from "react";
import ProductListSkeleton from "@/components/Skelton";

export default async function AdminProductsPage() {
  const page = 1;
  const limit = 20;

  // Use the correct route: /api/products
  const res = await fetch(
    `${SITE_URL}/api/products?page=${page}&limit=${limit}`,
    { cache: "force-cache", next: { revalidate: 60 } }
  );

  if (!res.ok) {
    console.error("Failed to fetch initial products");
    return <div className="p-6 text-center">Failed to load products</div>;
  }

  const data = await res.json();

  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductsClientPage
        initialProducts={data.products}
        initialPage={data.currentPage}
        initialTotalPages={data.totalPages}
      />
    </Suspense>
  );
}
