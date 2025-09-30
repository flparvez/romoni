import OrderDetailsClient from "@/components/admin/OrderDetailsClient";
import { SITE_URL } from "@/types/product"
export type IdParams = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic"; // always SSR, no stale cache

export default async function AdminOrderDetailsPage({ params }: IdParams) {
  const {id} = await params
  const res = await fetch(`${SITE_URL}/api/orders/${id}`, {
    cache: "no-store", // ✅ always fresh
  })

  if (!res.ok) {
    return <div className="p-6 text-red-500">❌ Failed to fetch order</div>
  }

  const data = await res.json()

  return <OrderDetailsClient order={data?.order} />
}
