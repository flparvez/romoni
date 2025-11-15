import AdminNotificationButton from "@/components/admin/AdminNotificationButton";
import { DashboardCard } from "@/components/admin/DashboardCard";

import RecentOrdersCard from "@/components/admin/RecentOrdersCard";
import SalesChartWrapper from "@/components/admin/SalesChartWrapper";

import {
  getTotalOrders,
  getTotalProducts,
  getTotalRevenue,
  getTotalUsers,
  getPendingOrdersCount,
  getOutOfStockProductsCount,
} from "@/lib/action";

export default async function AdminDashboard() {
  const [
    revenue = 0,
    orders = 0,
    products = 0,
    users = 0,
    pendingCount = 0,
    outOfStockCount = 0,
  ] = await Promise.all([
    getTotalRevenue(),
    getTotalOrders(),
    getTotalProducts(),
    getTotalUsers(),
    getPendingOrdersCount(),
    getOutOfStockProductsCount(),
  ]);

  const formattedRevenue = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(revenue);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <AdminNotificationButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Revenue" value={formattedRevenue} icon="dollar" description="From completed orders" />
        <DashboardCard title="Total Orders" value={String(orders)} icon="shopping-cart" description={`${pendingCount} pending`} />
        <DashboardCard title="Total Products" value={String(products)} icon="package" description={`${outOfStockCount} out of stock`} />
        <DashboardCard title="Total Customers" value={String(users)} icon="users" description="Registered customers" />
      </div>

      {/* ✅ These now fetch data themselves */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <RecentOrdersCard />
        <SalesChartWrapper />
      </div>
    </div>
  );
}
