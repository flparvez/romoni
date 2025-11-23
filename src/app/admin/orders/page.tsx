import { Suspense } from "react";
import { SITE_URL } from "@/hooks/serverApi";
import AllOrders from "./AllOrders";
import ProductListSkeleton from "@/components/Skelton";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Helper to fetch orders based on URL Params
async function getOrders(searchParams: any) {
  const page = searchParams?.page || 1;
  const status = searchParams?.status || "ALL";
  const limit = 12;

  try {
    // Pass query params to API for Server-Side Filtering
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: String(status),
    });

    const res = await fetch(`${SITE_URL}/api/orders?${query.toString()}`, {
      cache: "no-store", // Admin needs real-time data
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    return {
      orders: data?.orders || [],
      counts: data?.counts || {},
      totalPages: data?.totalPages || 1,
      currentPage: Number(page),
    };
  } catch (error) {
    console.error("❌ Orders Fetch Error:", error);
    return { orders: [], counts: {}, totalPages: 1, currentPage: 1 };
  }
}

export default async function OrdersPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const { orders, counts, totalPages, currentPage } = await getOrders(searchParams);

  return (
    <main className="min-h-screen bg-gray-50/50 p-0 pb-20">
      <div className="max-w-[1600px] mx-auto">
        <Suspense fallback={<ProductListSkeleton />}>
          <AllOrders 
            initialOrders={orders} 
            initialCounts={counts} 
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </Suspense>
      </div>
    </main>
  );
}