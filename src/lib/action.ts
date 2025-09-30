// actions/product-actions.ts

import { Product} from '@/models/Product'
import { connectToDatabase } from './db'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { OrderItem } from '@/models/OrderItem'

export async function getProducts() {
  await connectToDatabase()
  const products = await Product.find().sort({ createdAt: -1 })
  return JSON.parse(JSON.stringify(products))
}




export async function deleteProduct(id: string) {
  await connectToDatabase()
  await Product.findByIdAndDelete(id)
}




//  admin


export async function getTotalRevenue(): Promise<number> {
  await connectToDatabase()
  
  // Calculate total revenue from delivered orders including delivery charge
  const deliveredOrders = await Order.find({ status: 'DELIVERED' })
  
  const totalRevenue = deliveredOrders.reduce((total, order) => {
    return total + (order.totalAmount + order.deliveryCharge)
  }, 0)

  return totalRevenue
}

export async function getTotalOrders(): Promise<number> {
  await connectToDatabase()
  
  // Count all orders regardless of status
  const totalOrders = await Order.countDocuments()
  return totalOrders
}

export async function getPendingOrdersCount(): Promise<number> {
  await connectToDatabase()
  
  // Count pending orders
  const pendingOrders = await Order.countDocuments({ status: 'PENDING' })
  return pendingOrders
}

export async function getTotalProducts(): Promise<number> {
  await connectToDatabase()
  
  // Count all products (excluding any filtering for now)
  const totalProducts = await Product.countDocuments()
  return totalProducts
}

export async function getOutOfStockProductsCount(): Promise<number> {
  await connectToDatabase()
  
  // Count products with stock <= 0
  const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } })
  return outOfStock
}

export async function getTotalUsers(): Promise<number> {
  await connectToDatabase()
  
  // Count all users (excluding admins if needed)
  const totalUsers = await User.countDocuments()
  return totalUsers
}

// Get recent orders with populated items
export async function getRecentOrders(limit = 5) {
  await connectToDatabase()
  
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: 'items',
      populate: {
        path: 'product',
        select: 'name imageUrl price'
      }
    })
    .lean()

  return JSON.parse(JSON.stringify(recentOrders))
}

// Get sales analytics data
export async function getSalesAnalytics() {
  await connectToDatabase()
  
  // Last 30 days sales data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: 'DELIVERED'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: { $add: ['$totalAmount', '$deliveryCharge'] } },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: { $add: ['$totalAmount', '$deliveryCharge'] } }
      }
    },
    { $sort: { _id: 1 } }
  ])

  return salesData
}

// Get order status distribution
export async function getOrderStatusDistribution() {
  await connectToDatabase()
  
  const statusDistribution = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])

  return statusDistribution
}

// Get popular products
export async function getPopularProducts(limit = 5) {
  await connectToDatabase()
  
  const popularProducts = await OrderItem.aggregate([
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        productId: '$_id',
        productName: '$productDetails.name',
        productImage: '$productDetails.imageUrl',
        totalQuantity: 1,
        totalRevenue: 1
      }
    }
  ])

  return popularProducts
}