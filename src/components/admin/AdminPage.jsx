"use client";
import { useState } from "react";
import {
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Edit,
} from "lucide-react";

export default function AdminPage() {
  const [orderStatuses, setOrderStatuses] = useState({
    "ORD-001": "Processing",
    "ORD-002": "Shipped",
    "ORD-003": "Delivered",
    "ORD-004": "Processing",
    "ORD-005": "Cancelled",
    "ORD-006": "Shipped",
  });

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-600 text-yellow-100";
      case "Shipped":
        return "bg-blue-600 text-blue-100";
      case "Delivered":
        return "bg-green-600 text-green-100";
      case "Cancelled":
        return "bg-red-600 text-red-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage orders, payments, and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">₹2,45,680</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Orders</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <Package className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Customers</p>
                <p className="text-2xl font-bold">856</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-400">₹12,450</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">This Week</p>
              <p className="text-2xl font-bold text-blue-400">₹89,320</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">This Month</p>
              <p className="text-2xl font-bold text-purple-400">₹3,45,680</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Payment Methods</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Razorpay</span>
                  <span>₹1,89,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">UPI</span>
                  <span>₹89,230</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Card</span>
                  <span>₹67,000</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Transaction Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Successful</span>
                  <span className="text-green-400">1,198</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Failed</span>
                  <span className="text-red-400">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-yellow-400">26</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">All Orders</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-2 font-medium">ORD-001</td>
                  <td className="py-4 px-2">John Doe</td>
                  <td className="py-4 px-2 text-gray-400">2024-01-15</td>
                  <td className="py-4 px-2">₹2,499</td>
                  <td className="py-4 px-2">
                    <select
                      value={orderStatuses["ORD-001"]}
                      onChange={(e) =>
                        handleStatusChange("ORD-001", e.target.value)
                      }
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        getStatusColor(orderStatuses["ORD-001"]) +
                        " border-none outline-none"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td className="py-4 px-2 font-medium">ORD-002</td>
                  <td className="py-4 px-2">Jane Smith</td>
                  <td className="py-4 px-2 text-gray-400">2024-01-14</td>
                  <td className="py-4 px-2">₹1,899</td>
                  <td className="py-4 px-2">
                    <select
                      value={orderStatuses["ORD-002"]}
                      onChange={(e) =>
                        handleStatusChange("ORD-002", e.target.value)
                      }
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        getStatusColor(orderStatuses["ORD-002"]) +
                        " border-none outline-none"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td className="py-4 px-2 font-medium">ORD-003</td>
                  <td className="py-4 px-2">Mike Johnson</td>
                  <td className="py-4 px-2 text-gray-400">2024-01-13</td>
                  <td className="py-4 px-2">₹3,299</td>
                  <td className="py-4 px-2">
                    <select
                      value={orderStatuses["ORD-003"]}
                      onChange={(e) =>
                        handleStatusChange("ORD-003", e.target.value)
                      }
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        getStatusColor(orderStatuses["ORD-003"]) +
                        " border-none outline-none"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td className="py-4 px-2 font-medium">ORD-004</td>
                  <td className="py-4 px-2">Sarah Wilson</td>
                  <td className="py-4 px-2 text-gray-400">2024-01-12</td>
                  <td className="py-4 px-2">₹1,599</td>
                  <td className="py-4 px-2">
                    <select
                      value={orderStatuses["ORD-004"]}
                      onChange={(e) =>
                        handleStatusChange("ORD-004", e.target.value)
                      }
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        getStatusColor(orderStatuses["ORD-004"]) +
                        " border-none outline-none"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td className="py-4 px-2 font-medium">ORD-005</td>
                  <td className="py-4 px-2">David Brown</td>
                  <td className="py-4 px-2 text-gray-400">2024-01-11</td>
                  <td className="py-4 px-2">₹2,799</td>
                  <td className="py-4 px-2">
                    <select
                      value={orderStatuses["ORD-005"]}
                      onChange={(e) =>
                        handleStatusChange("ORD-005", e.target.value)
                      }
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        getStatusColor(orderStatuses["ORD-005"]) +
                        " border-none outline-none"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="border-b border-gray-800">
                  <td className="py-4 px-2 font-medium">ORD-006</td>
                  <td className="py-4 px-2">Lisa Davis</td>
                  <td className="py-4 px-2 text-gray-400">2024-01-10</td>
                  <td className="py-4 px-2">₹1,299</td>
                  <td className="py-4 px-2">
                    <select
                      value={orderStatuses["ORD-006"]}
                      onChange={(e) =>
                        handleStatusChange("ORD-006", e.target.value)
                      }
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium " +
                        getStatusColor(orderStatuses["ORD-006"]) +
                        " border-none outline-none"
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
