// app/admin/orders/page.tsx
import { SITE_URL } from "@/hooks/serverApi";
import AllOrders from "./AllOrders";
import { Suspense } from "react";
import ProductListSkeleton from "@/components/Skelton";

// Small helper to fetch orders (no caching so Admin always sees fresh data)
async function getOrders() {
  try {
    const res = await fetch(`${SITE_URL}/api/orders`, {
      cache: "force-cache" , next: { revalidate: 60}
    });
    if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);

    const data = await res.json();
   
    return {
      orders: data?.orders || [],
      counts: data?.counts || {},
    };
  } catch (error) {
    console.error("❌ Orders Fetch Error:", error);
    return { orders: [], counts: {} };
  }
}

export default async function OrdersPage() {
  const { orders, counts } = await getOrders();

  return (
    <main className="min-h-screen bg-gray-50 p-0">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<ProductListSkeleton />}>
          <AllOrders initialOrders={orders} initialCounts={counts} />
        </Suspense>
      </div>
    </main>
  );
}
