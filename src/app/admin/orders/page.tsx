import { SITE_URL } from "@/types/product";
import AllOrders from "./AllOrders";

export const revalidate = 60;

export default async function OrdersPage() {
  const res = await fetch(`/api/orders/filter`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch orders");

  const data = await res.json();
  const orders = data?.orders || [];
  const counts = data?.counts || {};

  return <AllOrders initialOrders={orders} initialCounts={counts} />;
}
