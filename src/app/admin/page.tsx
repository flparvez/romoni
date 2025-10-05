// app/(admin)/page.tsx
import AdminNotificationButton from '@/components/admin/AdminNotificationButton';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RecentOrdersCard } from '@/components/admin/RecentOrdersCard';
import { SalesChartCard } from '@/components/admin/SalesChartCard';

import { 
  getTotalOrders, 
  getTotalProducts, 
  getTotalRevenue, 
  getTotalUsers,
  getPendingOrdersCount,
  getOutOfStockProductsCount,
  getRecentOrders,
  getSalesAnalytics
} from '@/lib/action';

// By not exporting 'dynamic', this page defaults to static generation.
// The data will be fetched at build time and revalidated according to the 'unstable_cache' settings.

export default async function AdminDashboard() {

  // Fetch all dashboard data concurrently. Next.js will use the cached versions.
  const [
    totalRevenue, 
    totalOrders, 
    totalProducts, 
    totalUsers,
    pendingOrders,
    outOfStockProducts,
    recentOrders,
    salesData
  ] = await Promise.all([
    getTotalRevenue(),
    getTotalOrders(),
    getTotalProducts(),
    getTotalUsers(),
    getPendingOrdersCount(),
    getOutOfStockProductsCount(),
    getRecentOrders(),
    getSalesAnalytics()
  ]);

  // Format currency for display
  const formattedTotalRevenue = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  return (
    <div className="space-y-6">
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <AdminNotificationButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Revenue" 
          value={formattedTotalRevenue} 
          icon="dollar"
          description="From all delivered orders"
        />
        <DashboardCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          icon="shopping-cart"
          description={`${pendingOrders} pending`}
        />
        <DashboardCard 
          title="Total Products" 
          value={totalProducts.toString()} 
          icon="package"
          description={`${outOfStockProducts} out of stock`}
        />
        <DashboardCard 
          title="Total Customers" 
          value={totalUsers.toString()} 
          icon="users"
          description="Registered users"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <RecentOrdersCard orders={recentOrders} />
        </div>
        <div className="lg:col-span-2">
            <SalesChartCard data={salesData} />
        </div>
      </div>
    </div>
  );
}
