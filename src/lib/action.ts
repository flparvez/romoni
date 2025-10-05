// lib/action.ts
"use server";

import { unstable_cache as cache } from 'next/cache';
import { Product } from '@/models/Product';
import { connectToDatabase } from './db';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { OrderItem } from '@/models/OrderItem';

// --- Reusable constant for revalidation time ---
const REVALIDATE_TIME = 120; // 2 minutes
const REVALIDATE_PRODUCTS = 60; // 1 minute
// --- Cached Admin Dashboard Functions ---

export const getTotalRevenue = cache(
  async (): Promise<number> => {
    await connectToDatabase();
    // ✅ Optimized with aggregation for better performance
    const result = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      {
        $group: {
          _id: null,
          total: { $sum: { $add: ['$totalAmount', '$deliveryCharge'] } }
        }
      }
    ]);
    return result[0]?.total || 0;
  },
  ['get-total-revenue'],
  { revalidate: REVALIDATE_TIME, tags: ['dashboard-data', 'orders'] }
);

export const getTotalOrders = cache(
  async (): Promise<number> => {
    await connectToDatabase();
    return await Order.countDocuments();
  },
  ['get-total-orders'],
  { revalidate: REVALIDATE_TIME, tags: ['dashboard-data', 'orders'] }
);

export const getPendingOrdersCount = cache(
  async (): Promise<number> => {
    await connectToDatabase();
    return await Order.countDocuments({ status: 'PENDING' });
  },
  ['get-pending-orders-count'],
  { revalidate: REVALIDATE_TIME, tags: ['dashboard-data', 'orders'] }
);

export const getTotalProducts = cache(
  async (): Promise<number> => {
    await connectToDatabase();
    return await Product.countDocuments();
  },
  ['get-total-products'],
  { revalidate: REVALIDATE_TIME * 5, tags: ['dashboard-data', 'products'] } // Less frequent revalidation
);

export const getOutOfStockProductsCount = cache(
  async (): Promise<number> => {
    await connectToDatabase();
    return await Product.countDocuments({ stock: { $lte: 0 } });
  },
  ['get-out-of-stock-products-count'],
  { revalidate: REVALIDATE_TIME * 5, tags: ['dashboard-data', 'products'] }
);

export const getTotalUsers = cache(
  async (): Promise<number> => {
    await connectToDatabase();
    return await User.countDocuments();
  },
  ['get-total-users'],
  { revalidate: REVALIDATE_TIME * 10, tags: ['dashboard-data', 'users'] } // Even less frequent
);

export const getRecentOrders = cache(
  async (limit = 5) => {
    await connectToDatabase();
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'items',
        model: OrderItem, // ✅ FIX: Explicitly provide the model to prevent registration errors
        populate: { 
          path: 'product', 
          model: Product, // ✅ Do the same for nested population
          select: 'name price' 
        }
      })
      .lean();
    return JSON.parse(JSON.stringify(recentOrders));
  },
  ['get-recent-orders'],
  { revalidate: REVALIDATE_TIME, tags: ['dashboard-data', 'orders'] }
);

export const getSalesAnalytics = cache(
  async () => {
    await connectToDatabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'DELIVERED' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: { $add: ['$totalAmount', '$deliveryCharge'] } },
        }
      },
      { $sort: { _id: 1 } }
    ]);
  },
  ['get-sales-analytics'],
  { revalidate: REVALIDATE_TIME, tags: ['dashboard-data', 'orders', 'analytics'] }
);

// Other non-dashboard functions remain unchanged
export async function getProducts() {
  await connectToDatabase()
  const products = await Product.find().sort({ createdAt: -1 })
  return JSON.parse(JSON.stringify(products))
}

export async function deleteProduct(id: string) {
  await connectToDatabase()
  await Product.findByIdAndDelete(id)
}


// --- Cached Product Management Functions ---

// ✅ New cached function for the admin products page
export const getAdminProducts = cache(
  async () => {
    await connectToDatabase();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  },
  ['get-admin-products'],
  { revalidate: REVALIDATE_PRODUCTS, tags: ['products', 'admin-products'] }
);
