import { Suspense } from "react";
import ProductsClientPage from "@/components/admin/Product/ProductsClientPage";
import { SITE_URL } from "@/hooks/serverApi";
import ProductListSkeleton from "@/components/Skelton";

// Define Page Props to catch Search Params
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminProductsPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  
  // Parse Query Params
  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "latest";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";
  
  // Build Query String for Server Fetch
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    sort,
    ...(category && { category }),
  });

  // Initial Fetch on Server (Super Fast)
  const res = await fetch(`${SITE_URL}/api/products?${query.toString()}`, {
    cache: "no-store", // Ensure fresh data on navigation
  });

  if (!res.ok) {
    return <div className="p-10 text-center text-red-500">Failed to load products. Please check API.</div>;
  }

  const data = await res.json();

  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductsClientPage
        initialProducts={data.products || []}
        initialPage={data.currentPage || 1}
        initialTotalPages={data.totalPages || 1}
      />
    </Suspense>
  );
}