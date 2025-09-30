// app/(admin)/page.tsx
import AdminNotificationButton from '@/components/admin/AdminNotificationButton';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RecentOrdersCard } from '@/components/admin/RecentOrdersCard';
import { SalesChartCard } from '@/components/admin/SalesChartCard'; // Import the refactored chart card

import { 
  getTotalOrders, 
  getTotalProducts, 
  getTotalRevenue, 
  getTotalUsers,
  getPendingOrdersCount,
  getOutOfStockProductsCount,
  getRecentOrders,
  getSalesAnalytics // This function fetches our sales data on the server
} from '@/lib/action'; // Assuming your actions are here

export default async function AdminDashboard() {

  // Fetch all dashboard data concurrently for better performance
  const [
    totalRevenue, 
    totalOrders, 
    totalProducts, 
    totalUsers,
    pendingOrders,
    outOfStockProducts,
    recentOrders,
    salesData // <-- Capture the sales data here
  ] = await Promise.all([
    getTotalRevenue(),
    getTotalOrders(),
    getTotalProducts(),
    getTotalUsers(),
    getPendingOrdersCount(),
    getOutOfStockProductsCount(),
    getRecentOrders(),
    getSalesAnalytics() // <-- Fetch sales data on the server
  ]);

  // Format currency for display
  const formattedTotalRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2
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
          description="All delivered orders"
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
            {/* Pass the server-fetched recent orders to the component */}
            <RecentOrdersCard orders={recentOrders} />
        </div>
        <div className="lg:col-span-2">
            {/* Pass the server-fetched sales data directly as a prop */}
            <SalesChartCard data={salesData} />
        </div>
      </div>
    </div>
  );
}